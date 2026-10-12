import unittest
from unittest.mock import patch

from pracasegura_ds.spatial_audit import build_spatial_report


class SpatialAuditTests(unittest.TestCase):
    @patch("pracasegura_ds.spatial_audit.get_datastore_total", return_value=2)
    @patch("pracasegura_ds.spatial_audit.get_resource_metadata")
    @patch("pracasegura_ds.spatial_audit.load_json_resource")
    @patch("pracasegura_ds.spatial_audit.iter_csv_records")
    def test_reports_polygon_components_and_point_counts(
        self, iter_csv, load_geojson, resource_metadata, datastore_total
    ):
        resource_metadata.side_effect = [
            {"url": "https://dados.recife.pe.gov.br/parks.geojson"},
            {
                "url": "https://dados.recife.pe.gov.br/posts.csv",
                "last_modified": "2026-03-04",
                "format": "CSV",
            },
        ]
        square = [[-35.0, -8.0], [-34.0, -8.0], [-34.0, -7.0], [-35.0, -7.0], [-35.0, -8.0]]
        feature = {
            "type": "Feature",
            "properties": {
                "NMNOME": "CASA FORTE",
                "NMNOMEOFIC": "Praça de Casa Forte",
                "NOMEBAIRR": "CASA FORTE",
                "CDTIPO": "PRAÇA",
            },
            "geometry": {"type": "Polygon", "coordinates": [square]},
        }
        load_geojson.return_value = {"type": "FeatureCollection", "features": [feature]}
        iter_csv.return_value = iter(
            [
                {"latitude": "-7.5", "longitude": "-34.5"},
                {"latitude": "-6.0", "longitude": "-34.5"},
            ]
        )

        report = build_spatial_report(["postes"])
        self.assertEqual(report["place_polygon_components"]["casa_forte"], 1)
        dataset = report["datasets"][0]
        self.assertEqual(dataset["records_inside_place_polygons"]["casa_forte"], 1)
        self.assertEqual(dataset["published_csv_rows"], 2)
        self.assertTrue(dataset["csv_and_index_counts_match"])
        self.assertEqual(dataset["metadata"]["publisher"], "EMLURB")
        self.assertEqual(dataset["metadata"]["license"], "Open Data Commons Open Database License (ODbL)")
        self.assertEqual(dataset["metadata"]["file_last_modified"], "2026-03-04")


if __name__ == "__main__":
    unittest.main()
