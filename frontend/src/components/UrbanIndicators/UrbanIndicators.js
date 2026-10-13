import { useEffect, useState } from 'react';
import './UrbanIndicators.css';

const sourceFile = '/api/urban-indicators';

function formatGenerationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'data de geração indisponível';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date);
}

function UrbanIndicators({ squareName, sourceKey }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(sourceFile, { credentials: 'same-origin', cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('Relatório indisponível');
        return response.json();
      })
      .then((data) => { if (active) setReport(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  const dataset = report?.datasets?.find((item) => item.source === 'postes');
  const space = sourceKey
    ? dataset?.spaces?.find((item) => item.source_key === sourceKey)
    : dataset?.spaces?.find((item) => item.name === squareName || item.official_name === squareName);

  return (
    <section className="urban-indicators" aria-labelledby="urban-indicators-title">
      <div className="urban-indicators-heading">
        <span className="section-label">INFRAESTRUTURA URBANA</span>
        <h2 id="urban-indicators-title">Iluminação pública</h2>
        <p>Recorte do inventário geolocalizado dentro dos limites oficiais mapeados deste espaço.</p>
      </div>

      {error ? (
        <p role="status">Os dados públicos não estão disponíveis no momento.</p>
      ) : !report ? (
        <p role="status">Carregando dados do inventário...</p>
      ) : !space || space.polygon_components === 0 || space.identified_poles == null ? (
        <p>Dados indisponíveis: não foi possível validar uma correspondência com o polígono oficial.</p>
      ) : (
        <div className="urban-indicator-card">
          <div className="urban-indicator-value">
            <strong>{space.unidentified_records_inside > 0
              ? 'Indisponível'
              : new Intl.NumberFormat('pt-BR').format(space.identified_poles)}</strong>
            <span>
              {space.unidentified_records_inside > 0
                ? `${new Intl.NumberFormat('pt-BR').format(space.identified_poles)} IDs identificados; ${space.unidentified_records_inside} registros sem ID impedem informar o total.`
                : 'IDs de poste distintos identificados dentro do perímetro'}
            </span>
          </div>
          <p className="urban-indicator-method">
            Cruzamento espacial de pontos do inventário de iluminação de 2025 com {space.polygon_components} {space.polygon_components === 1 ? 'polígono municipal' : 'polígonos municipais'}.
          </p>
          <p className="urban-indicator-caveat">
            Registros sem identificador: {space.unidentified_records_inside}. Linhas repetidas consolidadas: {space.duplicate_rows_collapsed}. A contagem não confirma postes físicos únicos nem funcionamento; o inventário não oferece um campo confiável de estado operacional.
          </p>
          <div className="urban-indicator-source">
            <span>Fonte: {dataset.metadata?.publisher || 'EMLURB'} · dados atualizados no portal em {dataset.metadata?.last_data_update_on_portal || 'data não informada'} · análise gerada em {formatGenerationDate(report.generated_at_utc)}.</span>
            <a href={dataset.metadata?.dataset_page || dataset.resource_page} target="_blank" rel="noreferrer">Abrir dados e licença ODbL ↗</a>
          </div>
        </div>
      )}
    </section>
  );
}

export default UrbanIndicators;
