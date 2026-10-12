"""CLI para auditar fontes CKAN e emitir relatório JSON agregado."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

from .ckan import CKANError, get_datastore_total, get_resource_metadata, iter_csv_records
from .quality import audit_records
from .sources import SOURCES, get_source


def build_report(source_keys: list[str]) -> dict[str, object]:
    reports = []
    for key in source_keys:
        source = get_source(key)
        resource = get_resource_metadata(source.api_url, source.resource_id)
        download_url = resource["url"]
        if not isinstance(download_url, str):
            raise CKANError(f"URL de download inválida para {source.resource_id}")
        report = audit_records(source, iter_csv_records(download_url))
        datastore_count = get_datastore_total(source.api_url, source.resource_id)
        file_count = report["record_count"]
        report["metadata"] = {
            "publisher": source.publisher,
            "license": source.license_name,
            "last_data_update_on_portal": source.last_data_update,
            "file_last_modified": resource.get("last_modified"),
            "file_size_bytes": resource.get("size"),
            "format": resource.get("format"),
            "dataset_page": source.dataset_page,
            "resource_page": source.resource_page,
        }
        report["source_count_comparison"] = {
            "published_csv_rows": file_count,
            "ckan_datastore_indexed_rows": datastore_count,
            "counts_match": file_count == datastore_count,
        }
        reports.append(report)
    return {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "method": {
            "source": "CSV publicado no Portal de Dados Abertos do Recife; API CKAN usada para metadados e comparação do índice",
            "coordinate_envelope_note": "Envelope aproximado para triagem; não representa o limite oficial do município.",
            "raw_rows_persisted": False,
        },
        "datasets": reports,
    }


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--sources",
        nargs="+",
        choices=[source.key for source in SOURCES],
        default=[source.key for source in SOURCES],
        help="Fontes a consultar (padrão: todas)",
    )
    parser.add_argument("--output", type=Path, help="Arquivo JSON de destino; sem esta opção, imprime no terminal")
    args = parser.parse_args(argv)

    try:
        report = build_report(args.sources)
    except (CKANError, ValueError) as exc:
        print(f"Erro na auditoria: {exc}", file=sys.stderr)
        return 1

    rendered = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
        print(f"Relatório agregado salvo em {args.output}")
    else:
        print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
