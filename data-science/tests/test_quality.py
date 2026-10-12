import unittest

from pracasegura_ds.quality import audit_records
from pracasegura_ds.sources import get_source


class QualityAuditTests(unittest.TestCase):
    def test_reports_missing_coordinates_and_date_range_without_rows(self):
        source = get_source("demandas_156")
        report = audit_records(
            source,
            [
                {"latitude": -8.05, "longitude": -34.9, "DATA_DEMANDA": "2026-01-02", "SITUACAO": "ATENDIDA"},
                {"latitude": None, "longitude": None, "DATA_DEMANDA": "inválida", "SITUACAO": "ATENDIDA"},
            ],
        )
        self.assertEqual(report["record_count"], 2)
        self.assertEqual(report["coordinates"]["inside_approximate_recife_envelope"], 1)
        self.assertEqual(report["coordinates"]["invalid_or_missing"], 1)
        self.assertEqual(report["date"]["invalid_or_missing"], 1)
        self.assertNotIn("records", report)

    def test_detects_duplicate_signatures_as_audit_flag(self):
        source = get_source("pracas")
        row = {"nome_equip_urbano": "Praça A", "nome_bairro": "Centro", "latitude": -8.05, "longitude": -34.9}
        report = audit_records(source, [row, row.copy()])
        self.assertEqual(report["repeated_signature_rows_for_review"], 1)


if __name__ == "__main__":
    unittest.main()
