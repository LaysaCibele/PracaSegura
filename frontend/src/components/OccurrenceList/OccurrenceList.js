
import { useEffect, useState } from 'react';
import { getOccurrences } from '../../services/occurrenceService';
import './OccurrenceList.css';

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

function OccurrenceList( { refreshKey }) {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOccurrences() {
      try {
        const data = await getOccurrences();
        setOccurrences(data);
      } catch {
        setError('Não foi possível carregar as ocorrências.');
      } finally {
        setLoading(false);
      }
    }

    loadOccurrences();
  }, [refreshKey]);

  return (
    <section className="occurrence-list-section" id="ocorrencias">
      <div className="occurrence-list-heading">
        <span className="section-label">04 — ACOMPANHAMENTO</span>
        <h2>Registros recentes.</h2>
        <p>
          Consulte as ocorrências registradas para os espaços públicos
          cadastrados no PraçaSegura.
        </p>
      </div>

      {loading && <p role="status">Carregando ocorrências...</p>}

      {!loading && error && <p role="alert">{error}</p>}

      {!loading && !error && occurrences.length === 0 && (
        <p>Nenhuma ocorrência registrada até o momento.</p>
      )}

      {!loading && !error && occurrences.length > 0 && (
        <div className="occurrence-list-grid">
          {occurrences.map((occurrence) => (
            <article className="occurrence-card" key={occurrence.id}>
              <div className="occurrence-card-top">
                <span className="occurrence-category">
                  {occurrence.category}
                </span>
                <span className="occurrence-status">
                  {occurrence.status}
                </span>
              </div>

              <h3>{occurrence.square?.name || 'Praça não identificada'}</h3>

              <p className="occurrence-location">
                {occurrence.square?.neighborhood || 'Bairro não informado'}
                {' · Recife'}
              </p>

              <p className="occurrence-description">
                {occurrence.description}
              </p>

              <time
                className="occurrence-date"
                dateTime={occurrence.createdAt}
              >
                Registrada em {formatDate(occurrence.createdAt)}
              </time>
            </article>
          ))}
        </div>
      )}

      <p className="occurrence-list-disclaimer">
        Os registros exibidos podem incluir dados demonstrativos utilizados
        nos testes do sistema. Eles não constituem confirmação de ocorrências
        reais nem avaliação oficial de segurança.
      </p>
    </section>
  );
}

export default OccurrenceList;