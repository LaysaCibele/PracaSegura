import io
import json
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from pracasegura_ds.ckan import CKANError, get_datastore_total, iter_csv_records, iter_records


class CKANPaginationTests(unittest.TestCase):
    @staticmethod
    def response(records, total):
        return io.BytesIO(json.dumps({"success": True, "result": {"records": records, "total": total}}).encode())

    @patch("pracasegura_ds.ckan.urlopen")
    def test_reads_all_pages(self, urlopen):
        urlopen.side_effect = [self.response([{"id": 1}, {"id": 2}], 3), self.response([{"id": 3}], 3)]
        records = list(iter_records("https://example.test/api", "resource", page_size=2))
        self.assertEqual(records, [{"id": 1}, {"id": 2}, {"id": 3}])
        offsets = [parse_qs(urlparse(call.args[0].full_url).query)["offset"][0] for call in urlopen.call_args_list]
        self.assertEqual(offsets, ["0", "2"])

    @patch("pracasegura_ds.ckan.urlopen")
    def test_rejects_early_end(self, urlopen):
        urlopen.return_value = self.response([], 1)
        with self.assertRaises(CKANError):
            list(iter_records("https://example.test/api", "resource"))

    def test_page_size_is_bounded(self):
        with self.assertRaises(ValueError):
            list(iter_records("https://example.test/api", "resource", page_size=501))

    @patch("pracasegura_ds.ckan.urlopen")
    def test_reads_published_semicolon_csv_as_utf8(self, urlopen):
        urlopen.return_value = io.BytesIO("nome;latitude\nPraça; -8,05\n".encode("utf-8"))
        records = list(iter_csv_records("https://dados.recife.pe.gov.br/public.csv"))
        self.assertEqual(records, [{"nome": "Praça", "latitude": " -8,05"}])

    @patch("pracasegura_ds.ckan.urlopen")
    def test_reads_datastore_total_separately(self, urlopen):
        urlopen.return_value = self.response([{"_id": 1}], 11_374)
        total = get_datastore_total("https://dados.recife.pe.gov.br/api/3/action/datastore_search", "resource")
        self.assertEqual(total, 11_374)


if __name__ == "__main__":
    unittest.main()
