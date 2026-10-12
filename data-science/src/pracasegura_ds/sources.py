"""Catálogo de recursos públicos que podem apoiar análises do PraçaSegura."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Source:
    key: str
    title: str
    publisher: str
    resource_id: str
    resource_page: str
    dataset_page: str
    license_name: str
    last_data_update: str
    latitude_field: str
    longitude_field: str
    date_field: str | None = None
    group_fields: tuple[str, ...] = ()
    duplicate_fields: tuple[str, ...] = ()

    @property
    def api_url(self) -> str:
        return "https://dados.recife.pe.gov.br/api/3/action/datastore_search"


SOURCES = (
    Source(
        key="pracas",
        title="Parques e Praças",
        publisher="Secretaria de Infraestrutura e Serviços Urbanos do Recife",
        resource_id="d2199b6f-1d24-4553-980b-e11dafc90e06",
        resource_page="https://dados.recife.pe.gov.br/dataset/parques-e-pracas/resource/d2199b6f-1d24-4553-980b-e11dafc90e06",
        dataset_page="https://dados.recife.pe.gov.br/dataset/parques-e-pracas",
        license_name="Open Data Commons Open Database License (ODbL)",
        last_data_update="2026-03-04",
        latitude_field="latitude",
        longitude_field="longitude",
        group_fields=("tipo_equip_urbano", "nome_bairro"),
        duplicate_fields=("nome_equip_urbano", "nome_bairro", "latitude", "longitude"),
    ),
    Source(
        key="postes",
        title="Iluminação Pública do Recife — 2025",
        publisher="EMLURB",
        resource_id="76cb7e65-1362-4ea7-ac04-453d67e41c64",
        resource_page="https://dados.recife.pe.gov.br/dataset/postes-iluminacao-publica-do-recife/resource/76cb7e65-1362-4ea7-ac04-453d67e41c64",
        dataset_page="https://dados.recife.pe.gov.br/dataset/postes-iluminacao-publica-do-recife",
        license_name="Open Data Commons Open Database License (ODbL)",
        last_data_update="2026-03-04",
        latitude_field="latitude",
        longitude_field="longitude",
        date_field="atualizaca",
        group_fields=("bairro", "tipo_lumin", "tipo_lampa"),
        duplicate_fields=("id_ponto", "sequencia", "latitude", "longitude", "atualizaca"),
    ),
    Source(
        key="demandas_156",
        title="Central de Atendimento de Serviços da EMLURB — 156 — 2026",
        publisher="EMLURB",
        resource_id="80c5b3cd-d4f7-466e-9031-e636ef56dd99",
        resource_page="https://dados.recife.pe.gov.br/dataset/central-de-atendimento-de-servicos-da-emlurb-156/resource/80c5b3cd-d4f7-466e-9031-e636ef56dd99",
        dataset_page="https://dados.recife.pe.gov.br/dataset/central-de-atendimento-de-servicos-da-emlurb-156",
        license_name="Open Data Commons Open Database License (ODbL)",
        last_data_update="2026-06-19",
        latitude_field="latitude",
        longitude_field="longitude",
        date_field="DATA_DEMANDA",
        group_fields=("GRUPOSERVICO_DESCRICAO", "SITUACAO"),
        duplicate_fields=("GRUPOSERVICO_CODIGO", "SERVICO_CODIGO", "BAIRRO", "DATA_DEMANDA", "SITUACAO", "latitude", "longitude"),
    ),
)


def get_source(key: str) -> Source:
    """Retorna uma fonte conhecida ou levanta ValueError para chaves inválidas."""
    for source in SOURCES:
        if source.key == key:
            return source
    valid_keys = ", ".join(source.key for source in SOURCES)
    raise ValueError(f"Fonte desconhecida: {key}. Opções: {valid_keys}")
