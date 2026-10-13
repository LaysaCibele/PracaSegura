"""Cruzamento de inventário de iluminação com os espaços do catálogo oficial."""

import json
import unicodedata
from collections import Counter, defaultdict
from collections.abc import Iterable
from pathlib import Path

PLAZA_GEOJSON_RESOURCE_ID = "054f05a9-a113-47e0-a46f-720e4828eaf2"
CATALOG_PATH = Path(__file__).resolve().parents[3] / "backend" / "src" / "main" / "resources" / "public-spaces.json"


def load_space_catalog(path: Path = CATALOG_PATH) -> list[dict[str, object]]:
    """Lê o catálogo versionado compartilhado com o backend."""
    with path.open(encoding="utf-8") as catalog_file:
        catalog = json.load(catalog_file)
    if not isinstance(catalog, list) or len(catalog) != 15:
        raise ValueError("O catálogo oficial deve conter exatamente 15 espaços")
    keys = [item.get("sourceKey") for item in catalog]
    if len(set(keys)) != len(keys) or any(not key for key in keys):
        raise ValueError("Cada espaço precisa de uma chave oficial estável e única")
    return catalog


def normalize_name(value: object) -> str:
    value = "".join(
        char
        for char in unicodedata.normalize("NFKD", str(value or "").casefold())
        if not unicodedata.combining(char)
    )
    return " ".join("".join(char if char.isalnum() else " " for char in value).split())


def _selector_matches(properties: dict[str, object], selector: dict[str, object]) -> bool:
    if normalize_name(properties.get("NOMEBAIRR")) != normalize_name(selector.get("neighborhood")):
        return False
    if normalize_name(properties.get("CDTIPO")) != normalize_name(selector.get("type")):
        return False
    official_name = selector.get("officialName")
    if official_name and normalize_name(properties.get("NMNOMEOFIC")) != normalize_name(official_name):
        return False
    source_name = selector.get("sourceName")
    if source_name and normalize_name(properties.get("NMNOME")) != normalize_name(source_name):
        return False
    return True


def index_place_geometries(
    features: Iterable[dict[str, object]],
    catalog: list[dict[str, object]] | None = None,
) -> dict[str, list[dict[str, object]]]:
    """Agrupa polígonos pelos seletores oficiais de nome, bairro e tipo."""
    spaces = catalog if catalog is not None else load_space_catalog()
    places = {str(item["sourceKey"]): [] for item in spaces}
    for feature in features:
        properties = feature.get("properties")
        geometry = feature.get("geometry")
        if not isinstance(properties, dict) or not isinstance(geometry, dict):
            continue
        if geometry.get("type") not in {"Polygon", "MultiPolygon"}:
            continue
        for item in spaces:
            selector = item.get("polygon")
            if isinstance(selector, dict) and _selector_matches(properties, selector):
                places[str(item["sourceKey"])].append(geometry)
    return places


def _on_segment(x: float, y: float, start: list[float], end: list[float]) -> bool:
    cross = (x - start[0]) * (end[1] - start[1]) - (y - start[1]) * (end[0] - start[0])
    return (
        abs(cross) <= 1e-10
        and min(start[0], end[0]) - 1e-10 <= x <= max(start[0], end[0]) + 1e-10
        and min(start[1], end[1]) - 1e-10 <= y <= max(start[1], end[1]) + 1e-10
    )


def _in_ring(longitude: float, latitude: float, ring: list[list[float]]) -> bool:
    inside = False
    for index, start in enumerate(ring):
        end = ring[(index + 1) % len(ring)]
        if _on_segment(longitude, latitude, start, end):
            return True
        if (start[1] > latitude) != (end[1] > latitude):
            crossing_longitude = (
                (end[0] - start[0]) * (latitude - start[1]) / (end[1] - start[1]) + start[0]
            )
            if longitude < crossing_longitude:
                inside = not inside
    return inside


def _in_polygon(longitude: float, latitude: float, rings: list[list[list[float]]]) -> bool:
    return bool(rings) and _in_ring(longitude, latitude, rings[0]) and not any(
        _in_ring(longitude, latitude, hole) for hole in rings[1:]
    )


def point_in_geometry(longitude: float, latitude: float, geometry: dict[str, object]) -> bool:
    """Testa ponto WGS84 em Polygon/MultiPolygon, respeitando anéis internos."""
    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates")
    if not isinstance(coordinates, list):
        return False
    if geometry_type == "Polygon":
        return _in_polygon(longitude, latitude, coordinates)
    if geometry_type == "MultiPolygon":
        return any(_in_polygon(longitude, latitude, polygon) for polygon in coordinates)
    return False


def count_points_by_place(
    records: Iterable[dict[str, object]],
    place_geometries: dict[str, list[dict[str, object]]],
    *,
    latitude_field: str = "latitude",
    longitude_field: str = "longitude",
    point_id_field: str = "id_ponto",
) -> dict[str, object]:
    """Conta IDs distintos de poste em cada polígono e explicita linhas não identificadas."""
    point_ids: dict[str, set[str]] = defaultdict(set)
    unidentified_rows: Counter[str] = Counter()
    raw_rows: Counter[str] = Counter()
    total_records = 0
    missing_or_invalid = 0
    outside_all = 0
    multiple_place_matches = 0
    all_point_ids: set[str] = set()
    missing_point_ids = 0

    for record in records:
        total_records += 1
        raw_point_id = record.get(point_id_field)
        if raw_point_id is None:
            point_id = ""
        elif isinstance(raw_point_id, (int, float)) and float(raw_point_id).is_integer():
            point_id = str(int(raw_point_id))
        else:
            point_id = str(raw_point_id).strip()
        if point_id:
            all_point_ids.add(point_id)
        else:
            missing_point_ids += 1
        try:
            latitude = float(str(record.get(latitude_field, "")).strip().replace(",", "."))
            longitude = float(str(record.get(longitude_field, "")).strip().replace(",", "."))
        except (TypeError, ValueError):
            missing_or_invalid += 1
            continue
        if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
            missing_or_invalid += 1
            continue

        matched = [
            key
            for key, geometries in place_geometries.items()
            if any(point_in_geometry(longitude, latitude, geometry) for geometry in geometries)
        ]
        if not matched:
            outside_all += 1
        if len(matched) > 1:
            multiple_place_matches += 1

        for key in matched:
            raw_rows[key] += 1
            if point_id:
                point_ids[key].add(point_id)
            else:
                unidentified_rows[key] += 1

    return {
        "total_records": total_records,
        "unique_point_ids": len(all_point_ids),
        "missing_point_ids": missing_point_ids,
        "identified_poles_by_space": {key: len(point_ids[key]) for key in place_geometries},
        "records_inside_by_space": {key: raw_rows[key] for key in place_geometries},
        "unidentified_records_inside_by_space": {key: unidentified_rows[key] for key in place_geometries},
        "duplicate_rows_collapsed_by_space": {
            key: max(0, raw_rows[key] - len(point_ids[key]) - unidentified_rows[key])
            for key in place_geometries
        },
        "missing_or_invalid_coordinates": missing_or_invalid,
        "outside_all_place_polygons": outside_all,
        "records_matching_multiple_places": multiple_place_matches,
    }
