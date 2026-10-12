"""Correspondência e consulta de pontos nos polígonos públicos das quatro praças."""

import unicodedata
from collections import Counter
from collections.abc import Iterable


PLAZA_GEOJSON_RESOURCE_ID = "054f05a9-a113-47e0-a46f-720e4828eaf2"
PLACE_KEYS = ("casa_forte", "boa_viagem", "derby", "jaqueira")


def normalize_name(value: object) -> str:
    value = "".join(
        char
        for char in unicodedata.normalize("NFKD", str(value or "").casefold())
        if not unicodedata.combining(char)
    )
    return " ".join("".join(char if char.isalnum() else " " for char in value).split())


def _place_key(properties: dict[str, object]) -> str | None:
    official_name = normalize_name(properties.get("NMNOMEOFIC"))
    source_name = normalize_name(properties.get("NMNOME"))
    neighborhood = normalize_name(properties.get("NOMEBAIRR"))
    equipment_type = normalize_name(properties.get("CDTIPO"))

    if neighborhood == "casa forte" and official_name == "praca de casa forte":
        return "casa_forte"
    if neighborhood == "boa viagem" and official_name == "praca de boa viagem":
        return "boa_viagem"
    if neighborhood == "derby" and official_name == "praca do derby":
        return "derby"
    if neighborhood == "jaqueira" and equipment_type == "parque" and source_name == "da jaqueira":
        return "jaqueira"
    return None


def index_place_geometries(features: Iterable[dict[str, object]]) -> dict[str, list[dict[str, object]]]:
    """Agrupa polígonos oficiais pelos quatro locais informados pelo usuário."""
    places = {key: [] for key in PLACE_KEYS}
    for feature in features:
        properties = feature.get("properties")
        geometry = feature.get("geometry")
        if not isinstance(properties, dict) or not isinstance(geometry, dict):
            continue
        key = _place_key(properties)
        if key and geometry.get("type") in {"Polygon", "MultiPolygon"}:
            places[key].append(geometry)
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
    """Testa um ponto WGS84 em Polygon/MultiPolygon, respeitando anéis internos."""
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
) -> dict[str, object]:
    """Conta pontos dentro das geometrias e resume coordenadas ausentes/inválidas."""
    counts: Counter[str] = Counter()
    total_records = 0
    missing_or_invalid = 0
    outside_all = 0
    multiple_place_matches = 0
    for record in records:
        total_records += 1
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
            counts[key] += 1
    return {
        "total_records": total_records,
        "records_inside_place_polygons": {key: counts[key] for key in PLACE_KEYS},
        "missing_or_invalid_coordinates": missing_or_invalid,
        "outside_the_four_place_polygons": outside_all,
        "records_matching_multiple_places": multiple_place_matches,
    }
