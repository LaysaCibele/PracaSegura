import unittest

from pracasegura_ds.spatial import count_points_by_place, index_place_geometries, point_in_geometry


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
    def test_groups_components_for_the_four_named_places(self):
        polygon = {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}
        features = [
            feature("CASA FORTE", "Praça de Casa Forte", "Casa Forte", "PRAÇA", polygon),
            feature("CASA FORTE", "Praça de Casa Forte", "Casa Forte", "PRAÇA", polygon),
            feature("NOSSA SENHORA DA BOA VIAGEM", "Praça de Boa Viagem", "Boa Viagem", "PRAÇA", polygon),
            feature("DO DERBY", "Praça do Derby", "Derby", "PRAÇA", polygon),
            feature("DA JAQUEIRA", "Praça da Jaqueira", "Jaqueira", "PARQUE", polygon),
            feature("SOUTO FILHO", "Praça Souto Filho", "Jaqueira", "PRAÇA", polygon),
        ]

        indexed = index_place_geometries(features)
        self.assertEqual(
            {key: len(value) for key, value in indexed.items()},
            {"casa_forte": 2, "boa_viagem": 1, "derby": 1, "jaqueira": 1},
        )

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

    def test_counts_points_and_invalid_coordinates(self):
        polygon = {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}
        indexed = {"casa_forte": [polygon], "boa_viagem": [], "derby": [], "jaqueira": []}
        report = count_points_by_place(
            [
                {"latitude": "0.5", "longitude": "0.5"},
                {"latitude": "", "longitude": ""},
                {"latitude": "10", "longitude": "10"},
            ],
            indexed,
        )
        self.assertEqual(report["records_inside_place_polygons"]["casa_forte"], 1)
        self.assertEqual(report["total_records"], 3)
        self.assertEqual(report["missing_or_invalid_coordinates"], 1)
        self.assertEqual(report["outside_the_four_place_polygons"], 1)
        self.assertEqual(report["records_matching_multiple_places"], 0)


if __name__ == "__main__":
    unittest.main()
