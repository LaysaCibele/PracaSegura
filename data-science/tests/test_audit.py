import unittest
from unittest.mock import patch

from pracasegura_ds.audit import build_report


class AuditReportTests(unittest.TestCase):
    @patch("pracasegura_ds.audit.get_datastore_total", return_value=1)
    @patch("pracasegura_ds.audit.get_resource_metadata")
    @patch("pracasegura_ds.audit.iter_csv_records")
    def test_reports_csv_and_datastore_count_disagreement(self, iter_csv, resource_metadata, datastore_total):
        resource_metadata.return_value = {
            "url": "https://dados.recife.pe.gov.br/resource.csv",
            "format": "CSV",
            "size": 123,
            "last_modified": "2026-06-19T00:00:00",
        }
        iter_csv.return_value = iter(
            [
                {
                    "latitude": "-8.05",
                    "longitude": "-34.9",
                    "nome_equip_urbano": "Praça",
                    "nome_bairro": "Centro",
                    "tipo_equip_urbano": "Praça",
                },
                {
                    "latitude": "-8.06",
                    "longitude": "-34.91",
                    "nome_equip_urbano": "Parque",
                    "nome_bairro": "Centro",
                    "tipo_equip_urbano": "Parque",
                },
            ]
        )

        report = build_report(["pracas"])
        dataset = report["datasets"][0]
        self.assertEqual(dataset["record_count"], 2)
        self.assertEqual(dataset["source_count_comparison"]["ckan_datastore_indexed_rows"], 1)
        self.assertFalse(dataset["source_count_comparison"]["counts_match"])


if __name__ == "__main__":
    unittest.main()
