"""Auditoria espacial do inventário de iluminação nos 15 espaços selecionados."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

from .ckan import (
    CKANError,
    get_datastore_total,
    get_resource_metadata,
    iter_csv_records_with_audit,
    load_json_resource,
)
from .sources import get_source
from .spatial import (
    PLAZA_GEOJSON_RESOURCE_ID,
    count_points_by_place,
    index_place_geometries,
    load_space_catalog,
)


def build_spatial_report(source_keys: list[str]) -> dict[str, object]:
    catalog = load_space_catalog()
    plaza_source = get_source("pracas")
    geojson_resource = get_resource_metadata(plaza_source.api_url, PLAZA_GEOJSON_RESOURCE_ID)
    geojson_url = geojson_resource.get("url")
    if not isinstance(geojson_url, str):
        raise CKANError("GeoJSON municipal sem URL de download")
    collection = load_json_resource(geojson_url)
    features = collection.get("features")
    if not isinstance(features, list):
        raise CKANError("GeoJSON municipal sem lista de feições")
    polygons = index_place_geometries(features, catalog)

    datasets = []
    for key in source_keys:
        source = get_source(key)
        resource = get_resource_metadata(source.api_url, source.resource_id)
        csv_url = resource.get("url")
        if not isinstance(csv_url, str):
            raise CKANError(f"CSV sem URL de download para {source.resource_id}")
        csv_audit: dict[str, int] = {}
        spatial_counts = count_points_by_place(
            iter_csv_records_with_audit(csv_url, csv_audit),
            polygons,
            latitude_field=source.latitude_field,
            longitude_field=source.longitude_field,
            point_id_field="id_ponto" if key == "postes" else "id_ponto",
        )
        datastore_rows = get_datastore_total(source.api_url, source.resource_id)
        file_rows = csv_audit["rows"]
        processed_rows = spatial_counts["total_records"]
        spaces = []
        for item in catalog:
            source_key = str(item["sourceKey"])
            component_count = len(polygons[source_key])
            identified = spatial_counts["identified_poles_by_space"][source_key]
            spaces.append({
                "source_key": source_key,
                "name": item["displayName"],
                "official_name": item.get("officialName", item["displayName"]),
                "type": item["type"],
                "polygon_components": component_count,
                "identified_poles": identified if component_count else None,
                "records_inside": spatial_counts["records_inside_by_space"][source_key],
                "unidentified_records_inside": spatial_counts["unidentified_records_inside_by_space"][source_key],
                "duplicate_rows_collapsed": spatial_counts["duplicate_rows_collapsed_by_space"][source_key],
            })
        datasets.append(
            {
                "source": key,
                "title": source.title,
                "published_csv_rows": file_rows,
                "processed_csv_rows": processed_rows,
                "malformed_csv_rows_excluded": csv_audit["malformed_rows"],
                "ckan_datastore_indexed_rows": datastore_rows,
                "csv_and_index_counts_match": file_rows == datastore_rows,
                "unique_identified_point_ids": spatial_counts["unique_point_ids"],
                "missing_point_ids": spatial_counts["missing_point_ids"],
                "missing_or_invalid_coordinates": spatial_counts["missing_or_invalid_coordinates"],
                "outside_all_place_polygons": spatial_counts["outside_all_place_polygons"],
                "records_matching_multiple_places": spatial_counts["records_matching_multiple_places"],
                "spaces": spaces,
                "metadata": {
                    "publisher": source.publisher,
                    "license": source.license_name,
                    "last_data_update_on_portal": source.last_data_update,
                    "file_last_modified": resource.get("last_modified"),
                    "format": resource.get("format"),
                    "dataset_page": source.dataset_page,
                    "resource_page": source.resource_page,
                    "resource_id": source.resource_id,
                    "analysis_access": "Published UTF-8 semicolon CSV; malformed rows excluded and counted separately",
                },
                "resource_page": source.resource_page,
            }
        )

    return {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "method": {
            "space_catalog": "Official names, type, neighborhood, address, area and coordinates from the Recife Parques e Praças CSV.",
            "plaza_boundaries": "Official municipal GeoJSON matched by normalized official name, neighborhood and type; all matched geometry components are grouped.",
            "point_rule": "WGS84 point-in-polygon; a pole is counted once per space by distinct id_ponto. Records without id_ponto are reported separately and excluded from the pole count.",
            "malformed_rows": "Rows with inconsistent CSV column counts are excluded from spatial calculations and counted in the report; their location cannot be verified.",
            "raw_rows_persisted": False,
            "interpretation": "Identified pole IDs are inventory records, not confirmation of unique physical equipment or operating condition. The source has no verified operational-status field.",
        },
        "catalog_source": {
            "dataset_page": plaza_source.dataset_page,
            "resource_page": plaza_source.resource_page,
            "resource_id": plaza_source.resource_id,
            "publisher": plaza_source.publisher,
            "license": plaza_source.license_name,
            "last_data_update_on_portal": plaza_source.last_data_update,
        },
        "geometry_resource_page": "https://dados.recife.pe.gov.br/dataset/parques-e-pracas/resource/054f05a9-a113-47e0-a46f-720e4828eaf2",
        "place_polygon_components": {key: len(geometries) for key, geometries in polygons.items()},
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
        default=["postes"],
        help="Recursos pontuais a cruzar (padrão: postes)",
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
