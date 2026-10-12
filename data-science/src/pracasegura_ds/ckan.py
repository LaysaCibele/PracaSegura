"""Leitura de recursos CKAN sem persistir os registros brutos."""

import csv
import io
import json
from collections.abc import Iterator
from http.client import IncompleteRead
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class CKANError(RuntimeError):
    """Indica resposta inválida ou indisponível da API CKAN."""


def _json_response(url: str, *, timeout: int = 30) -> dict[str, object]:
    request = Request(url, headers={"User-Agent": "PracaSeguraDataAudit/0.1"})
    try:
        with urlopen(request, timeout=timeout) as response:
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError, IncompleteRead, json.JSONDecodeError) as exc:
        raise CKANError(f"Falha ao consultar a API CKAN: {exc}") from exc
    if not isinstance(payload, dict) or not payload.get("success"):
        raise CKANError("CKAN retornou uma resposta inválida")
    return payload


def get_resource_metadata(api_url: str, resource_id: str, *, timeout: int = 30) -> dict[str, object]:
    """Obtém os metadados do arquivo publicado e valida sua origem."""
    api_root = api_url.rsplit("/", 1)[0]
    query = urlencode({"id": resource_id})
    payload = _json_response(f"{api_root}/resource_show?{query}", timeout=timeout)
    result = payload.get("result")
    if not isinstance(result, dict) or not isinstance(result.get("url"), str):
        raise CKANError(f"Metadados sem URL de download para {resource_id}")
    if urlparse(result["url"]).hostname != "dados.recife.pe.gov.br":
        raise CKANError(f"URL de download fora do Portal de Dados do Recife para {resource_id}")
    return result


def load_json_resource(download_url: str, *, timeout: int = 60) -> dict[str, object]:
    """Carrega um GeoJSON público do portal em memória após validar o domínio."""
    if urlparse(download_url).hostname != "dados.recife.pe.gov.br":
        raise CKANError("URL GeoJSON fora do Portal de Dados do Recife")
    request = Request(download_url, headers={"User-Agent": "PracaSeguraDataAudit/0.1"})
    try:
        with urlopen(request, timeout=timeout) as response:
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError, IncompleteRead, json.JSONDecodeError) as exc:
        raise CKANError(f"Falha ao carregar GeoJSON público: {exc}") from exc
    if not isinstance(payload, dict) or payload.get("type") != "FeatureCollection":
        raise CKANError("O recurso geográfico não é uma FeatureCollection GeoJSON")
    return payload


def get_datastore_total(api_url: str, resource_id: str, *, timeout: int = 30) -> int:
    """Lê o total indexado no datastore para comparar com o arquivo publicado."""
    query = urlencode({"resource_id": resource_id, "limit": 1, "offset": 0})
    payload = _json_response(f"{api_url}?{query}", timeout=timeout)
    result = payload.get("result")
    total = result.get("total") if isinstance(result, dict) else None
    if not isinstance(total, int):
        raise CKANError(f"CKAN não informou o total indexado para {resource_id}")
    return total


def iter_csv_records(download_url: str, *, timeout: int = 90) -> Iterator[dict[str, object]]:
    """Lê o CSV publicado em streaming, sem gravá-lo em disco.

    Os recursos catalogados usam CSV UTF-8 separado por ponto e vírgula.
    Linhas com quantidade inconsistente de colunas interrompem a auditoria.
    """
    request = Request(download_url, headers={"User-Agent": "PracaSeguraDataAudit/0.1"})
    try:
        with urlopen(request, timeout=timeout) as response:
            text = io.TextIOWrapper(response, encoding="utf-8-sig", errors="replace", newline="")
            reader = csv.DictReader(text, delimiter=";")
            if not reader.fieldnames:
                raise CKANError("O CSV não contém cabeçalho")
            for row in reader:
                if None in row or any(value is None for value in row.values()):
                    raise CKANError(f"Linha {reader.line_num} do CSV possui quantidade inconsistente de colunas")
                yield row
    except (HTTPError, URLError, TimeoutError, IncompleteRead, UnicodeError, csv.Error) as exc:
        raise CKANError(f"Falha ao ler CSV publicado: {exc}") from exc


def iter_records(
    api_url: str,
    resource_id: str,
    *,
    page_size: int = 500,
    timeout: int = 30,
) -> Iterator[dict[str, object]]:
    """Percorre todas as linhas de um recurso CKAN em lotes pequenos.

    Os registros são mantidos apenas durante a execução do chamador. O tamanho
    máximo de página segue o limite observado no Portal de Dados do Recife.
    """
    if not 1 <= page_size <= 500:
        raise ValueError("page_size deve estar entre 1 e 500")

    offset = 0
    expected_total: int | None = None
    while expected_total is None or offset < expected_total:
        query = urlencode({"resource_id": resource_id, "limit": page_size, "offset": offset})
        request = Request(f"{api_url}?{query}", headers={"User-Agent": "PracaSeguraDataAudit/0.1"})
        try:
            with urlopen(request, timeout=timeout) as response:
                payload = json.load(response)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise CKANError(f"Falha ao consultar recurso {resource_id}: {exc}") from exc

        if not payload.get("success") or not isinstance(payload.get("result"), dict):
            raise CKANError(f"CKAN retornou resposta inválida para o recurso {resource_id}")
        result = payload["result"]
        records = result.get("records")
        total = result.get("total")
        if not isinstance(records, list) or not isinstance(total, int):
            raise CKANError(f"Resposta CKAN sem linhas ou total válido para {resource_id}")
        if expected_total is None:
            expected_total = total
        elif total != expected_total:
            raise CKANError(
                f"O total do recurso {resource_id} mudou durante a leitura "
                f"({expected_total} para {total}); execute a auditoria novamente"
            )
        if not records and offset < expected_total:
            raise CKANError(f"CKAN encerrou a paginação antes do esperado em {resource_id}")

        for record in records:
            if not isinstance(record, dict):
                raise CKANError(f"Registro inválido no recurso {resource_id}")
            yield record
        offset += len(records)
