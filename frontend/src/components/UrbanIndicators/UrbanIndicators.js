import { useEffect, useState } from 'react';
import './UrbanIndicators.css';

const sourceFile = '/data/urban-indicators.json';

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

function getPlaceKey(name) {
  const normalized = normalize(name);
  if (normalized.includes('casa forte')) return 'casa_forte';
  if (normalized.includes('boa viagem')) return 'boa_viagem';
  if (normalized.includes('derby')) return 'derby';
  if (normalized.includes('jaqueira')) return 'jaqueira';
  return null;
}

function formatGenerationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'data de geração indisponível';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date);
}

function UrbanIndicators({ squareName }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(sourceFile, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('Relatório indisponível');
        return response.json();
      })
      .then((data) => { if (active) setReport(data); })
      .catch(() => { if (active) setError(true); });

    return () => { active = false; };
  }, []);

  const key = getPlaceKey(squareName);
  const lighting = report?.datasets?.find((dataset) => dataset.source === 'postes');
  const records = key ? lighting?.records_inside_place_polygons?.[key] : undefined;
  const polygonCount = key ? report?.place_polygon_components?.[key] : undefined;

  return (
    <section className="urban-indicators" aria-labelledby="urban-indicators-title">
      <div className="urban-indicators-heading">
        <span className="section-label">INFRAESTRUTURA URBANA</span>
        <h2 id="urban-indicators-title">Iluminação pública</h2>
        <p>Um recorte do inventário público geolocalizado nos limites mapeados desta praça.</p>
      </div>

      {error ? (
        <p role="status">Os dados públicos não estão disponíveis no momento.</p>
      ) : !report ? (
        <p role="status">Carregando dados do inventário...</p>
      ) : records === undefined ? (
        <p>Não há correspondência geográfica confiável para este cadastro de praça.</p>
      ) : (
        <div className="urban-indicator-card">
          <div className="urban-indicator-value">
            <strong>{new Intl.NumberFormat('pt-BR').format(records)}</strong>
            <span>registros do inventário localizados dentro do perímetro mapeado</span>
          </div>
          <p className="urban-indicator-method">
            Cruzamento espacial de pontos do inventário de 2025 com {polygonCount} {polygonCount === 1 ? 'polígono municipal' : 'polígonos municipais'}.
          </p>
          <p className="urban-indicator-caveat">
            A contagem representa registros geolocalizados, não necessariamente postes únicos. O inventário não informa se a luminária está funcionando e não mede segurança.
          </p>
          <div className="urban-indicator-source">
            <span>Fonte: {lighting.metadata?.publisher || 'EMLURB'} · atualização informada: {lighting.metadata?.last_data_update_on_portal || 'não informada'} · análise gerada em {formatGenerationDate(report.generated_at_utc)}.</span>
            <a href={lighting.metadata?.dataset_page || lighting.resource_page} target="_blank" rel="noreferrer">Abrir dados e licença ODbL ↗</a>
          </div>
        </div>
      )}
    </section>
  );
}

export default UrbanIndicators;
