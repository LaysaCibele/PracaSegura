"""Auditoria espacial exploratória dos pontos próximos às quatro praças."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

from .ckan import CKANError, get_datastore_total, get_resource_metadata, iter_csv_records, load_json_resource
from .sources import get_source
from .spatial import PLAZA_GEOJSON_RESOURCE_ID, index_place_geometries, count_points_by_place


def build_spatial_report(source_keys: list[str]) -> dict[str, object]:
    plaza_source = get_source("pracas")
    geojson_resource = get_resource_metadata(plaza_source.api_url, PLAZA_GEOJSON_RESOURCE_ID)
    geojson_url = geojson_resource.get("url")
    if not isinstance(geojson_url, str):
        raise CKANError("GeoJSON municipal sem URL de download")
    collection = load_json_resource(geojson_url)
    features = collection.get("features")
    if not isinstance(features, list):
        raise CKANError("GeoJSON municipal sem lista de feições")
    polygons = index_place_geometries(features)

    datasets = []
    for key in source_keys:
        source = get_source(key)
        resource = get_resource_metadata(source.api_url, source.resource_id)
        csv_url = resource.get("url")
        if not isinstance(csv_url, str):
            raise CKANError(f"CSV sem URL de download para {source.resource_id}")
        spatial_counts = count_points_by_place(
            iter_csv_records(csv_url),
            polygons,
            latitude_field=source.latitude_field,
            longitude_field=source.longitude_field,
        )
        datastore_rows = get_datastore_total(source.api_url, source.resource_id)
        file_rows = spatial_counts["total_records"]
        datasets.append(
            {
                "source": key,
                "title": source.title,
                "published_csv_rows": file_rows,
                "ckan_datastore_indexed_rows": datastore_rows,
                "csv_and_index_counts_match": file_rows == datastore_rows,
                **spatial_counts,
                "metadata": {
                    "publisher": source.publisher,
                    "license": source.license_name,
                    "last_data_update_on_portal": source.last_data_update,
                    "file_last_modified": resource.get("last_modified"),
                    "format": resource.get("format"),
                    "dataset_page": source.dataset_page,
                    "resource_page": source.resource_page,
                },
                "resource_page": source.resource_page,
            }
        )

    return {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "method": {
            "plaza_boundaries": "Municipal GeoJSON grouped by official name, neighborhood, and equipment type.",
            "point_rule": "WGS84 point-in-polygon; all geometry parts for a named place are grouped.",
            "raw_rows_persisted": False,
            "interpretation": "Counts are records located inside polygons; they are not safety or equipment-condition scores.",
        },
        "place_polygon_components": {key: len(geometries) for key, geometries in polygons.items()},
        "geometry_resource_page": "https://dados.recife.pe.gov.br/dataset/parques-e-pracas/resource/054f05a9-a113-47e0-a46f-720e4828eaf2",
        "datasets": datasets,
    }


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--sources",
        nargs="+",
        choices=("postes", "demandas_156"),
        default=["postes", "demandas_156"],
        help="Recursos pontuais a cruzar (padrão: postes e demandas do 156)",
    )
    parser.add_argument("--output", type=Path, help="Arquivo JSON agregado; sem esta opção, imprime no terminal")
    args = parser.parse_args(argv)
    try:
        report = build_spatial_report(args.sources)
    except (CKANError, ValueError) as exc:
        print(f"Erro na auditoria espacial: {exc}", file=sys.stderr)
        return 1
    rendered = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
        print(f"Relatório espacial agregado salvo em {args.output}")
    else:
        print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
