import unittest

from pracasegura_ds.spatial import (
    count_points_by_place,
    index_place_geometries,
    load_space_catalog,
    point_in_geometry,
)


def feature(name, official, neighborhood, equipment_type, geometry):
    return {
        "properties": {
            "NMNOME": name,
            "NMNOMEOFIC": official,
            "NOMEBAIRR": neighborhood,
            "CDTIPO": equipment_type,
        },
        "geometry": geometry,
    }


class SpatialTests(unittest.TestCase):
    def test_catalog_has_12_plazas_and_three_parks(self):
        catalog = load_space_catalog()
        self.assertEqual(len(catalog), 15)
        self.assertEqual(sum(item["type"] == "PRACA" for item in catalog), 12)
        self.assertEqual(sum(item["type"] == "PARQUE" for item in catalog), 3)
        self.assertTrue(any(item["displayName"] == "Parque 13 de Maio" for item in catalog))

    def test_groups_components_using_official_name_neighborhood_and_type(self):
        polygon = {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}
        catalog = [
            {"sourceKey": "forte", "polygon": {"officialName": "Praça de Casa Forte", "neighborhood": "CASA FORTE", "type": "PRAÇA"}},
            {"sourceKey": "jaqueira", "polygon": {"sourceName": "DA JAQUEIRA", "neighborhood": "JAQUEIRA", "type": "PARQUE"}},
        ]
        features = [
            feature("CASA FORTE", "Praça de Casa Forte", "Casa Forte", "PRAÇA", polygon),
            feature("CASA FORTE", "Praça de Casa Forte", "Casa Forte", "PRAÇA", polygon),
            feature("DA JAQUEIRA", "Praça da Jaqueira", "Jaqueira", "PARQUE", polygon),
            feature("SOUTO FILHO", "Praça Souto Filho", "Jaqueira", "PRAÇA", polygon),
        ]
        indexed = index_place_geometries(features, catalog)
        self.assertEqual({key: len(value) for key, value in indexed.items()}, {"forte": 2, "jaqueira": 1})

    def test_respects_polygon_holes_and_boundary(self):
        geometry = {
            "type": "Polygon",
            "coordinates": [
                [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]],
                [[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]],
            ],
        }
        self.assertTrue(point_in_geometry(0, 2, geometry))
        self.assertTrue(point_in_geometry(0.5, 0.5, geometry))
        self.assertFalse(point_in_geometry(2, 2, geometry))
        self.assertFalse(point_in_geometry(5, 5, geometry))

    def test_counts_unique_pole_ids_and_reports_missing_ids_separately(self):
        polygon = {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}
        report = count_points_by_place(
            [
                {"latitude": "0.5", "longitude": "0.5", "id_ponto": 42},
                {"latitude": "0.6", "longitude": "0.6", "id_ponto": 42.0},
                {"latitude": "0.7", "longitude": "0.7", "id_ponto": None},
                {"latitude": "", "longitude": "", "id_ponto": 99},
                {"latitude": "10", "longitude": "10", "id_ponto": 100},
            ],
            {"space": [polygon], "unmapped": []},
        )
        self.assertEqual(report["identified_poles_by_space"]["space"], 1)
        self.assertEqual(report["unidentified_records_inside_by_space"]["space"], 1)
        self.assertEqual(report["duplicate_rows_collapsed_by_space"]["space"], 1)
        self.assertEqual(report["unique_point_ids"], 3)
        self.assertEqual(report["missing_point_ids"], 1)
        self.assertEqual(report["total_records"], 5)
        self.assertEqual(report["missing_or_invalid_coordinates"], 1)
        self.assertEqual(report["outside_all_place_polygons"], 1)
        self.assertEqual(report["records_matching_multiple_places"], 0)


if __name__ == "__main__":
    unittest.main()
