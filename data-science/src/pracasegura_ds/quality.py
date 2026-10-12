"""Métricas agregadas de qualidade; nenhum valor individual é exportado."""

from collections import Counter
from datetime import datetime
import hashlib
import json
from typing import Iterable

from .sources import Source


# Envelope amplo de triagem para Recife, não substitui limite municipal oficial.
RECIFE_BOUNDS = {"lat_min": -8.2, "lat_max": -7.9, "lon_min": -35.1, "lon_max": -34.8}
MISSING_MARKERS = {"", "null", "none", "nan", "n/a"}


def _is_missing(value: object) -> bool:
    return value is None or str(value).strip().lower() in MISSING_MARKERS


def _number(value: object) -> float | None:
    if _is_missing(value):
        return None
    try:
        return float(str(value).strip().replace(",", "."))
    except (TypeError, ValueError):
        return None


def _parse_date(value: object) -> datetime | None:
    if _is_missing(value):
        return None
    raw = str(value).strip().replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        return None


def _signature(record: dict[str, object], fields: tuple[str, ...]) -> str:
    stable_values = [str(record.get(field, "")).strip().casefold() for field in fields]
    return hashlib.sha256(json.dumps(stable_values, ensure_ascii=False).encode("utf-8")).hexdigest()


def audit_records(source: Source, records: Iterable[dict[str, object]]) -> dict[str, object]:
    """Resume completude, coordenadas, datas e grupos sem revelar linhas."""
    count = 0
    missing: Counter[str] = Counter()
    invalid_coordinates = 0
    inside_envelope = 0
    outside_envelope = 0
    dates: list[datetime] = []
    invalid_dates = 0
    groups: dict[str, Counter[str]] = {field: Counter() for field in source.group_fields}
    signatures: set[str] = set()
    duplicate_rows = 0
    fields_seen: set[str] = set()

    for record in records:
        count += 1
        fields_seen.update(str(field) for field in record)
        for field, value in record.items():
            if _is_missing(value):
                missing[str(field)] += 1

        latitude = _number(record.get(source.latitude_field))
        longitude = _number(record.get(source.longitude_field))
        if latitude is None or longitude is None or not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
            invalid_coordinates += 1
        elif (
            RECIFE_BOUNDS["lat_min"] <= latitude <= RECIFE_BOUNDS["lat_max"]
            and RECIFE_BOUNDS["lon_min"] <= longitude <= RECIFE_BOUNDS["lon_max"]
        ):
            inside_envelope += 1
        else:
            outside_envelope += 1

        if source.date_field:
            parsed = _parse_date(record.get(source.date_field))
            if parsed is None:
                invalid_dates += 1
            else:
                dates.append(parsed)

        for field, counts in groups.items():
            value = record.get(field)
            counts[str(value).strip() if not _is_missing(value) else "(ausente)"] += 1

        if source.duplicate_fields:
            signature = _signature(record, source.duplicate_fields)
            if signature in signatures:
                duplicate_rows += 1
            else:
                signatures.add(signature)

    def top_counts(counter: Counter[str]) -> list[dict[str, object]]:
        return [{"value": value, "count": amount} for value, amount in counter.most_common(15)]

    return {
        "source": source.key,
        "title": source.title,
        "record_count": count,
        "fields": sorted(fields_seen),
        "missing_by_field": dict(sorted(missing.items())),
        "coordinates": {
            "invalid_or_missing": invalid_coordinates,
            "inside_approximate_recife_envelope": inside_envelope,
            "outside_approximate_recife_envelope": outside_envelope,
            "envelope": RECIFE_BOUNDS,
        },
        "date": {
            "field": source.date_field,
            "invalid_or_missing": invalid_dates if source.date_field else None,
            "minimum": min(dates).isoformat() if dates else None,
            "maximum": max(dates).isoformat() if dates else None,
        },
        "repeated_signature_rows_for_review": duplicate_rows,
        "group_counts": {field: top_counts(counts) for field, counts in groups.items()},
        "privacy": "Somente agregados; os registros individuais não fazem parte do relatório.",
    }
