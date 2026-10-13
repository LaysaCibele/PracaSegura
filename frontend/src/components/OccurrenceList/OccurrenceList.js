
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getOccurrences,
  updateOccurrenceStatus,
} from '../../services/occurrenceService';

import './OccurrenceList.css';

const statusOptions = [
  { value: 'REGISTRADA', label: 'Registrada' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'RESOLVIDA', label: 'Resolvida' },
];

function formatDate(date) {
  if (!date) return 'Data não informada';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate);
}

function getStatusLabel(status) {
  return (
    statusOptions.find((option) => option.value === status)?.label ||
    status ||
    'Não informado'
  );
}

function OccurrenceList({ user, refreshKey, squareId = '', filters, onOccurrenceUpdated }) {
  const [occurrences, setOccurrences] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const isManager = user?.role === 'GESTOR';

  useEffect(() => {
    let active = true;

    async function loadOccurrences() {
      setLoading(true);
      setError('');

      try {
        if (!user) {
          if (active) setOccurrences([]);
          return;
        }

        const data = await getOccurrences({ ...(filters || {}), squareId: squareId || undefined });

        if (active) {
          setOccurrences(isManager ? data : data.filter((item) => item.origin !== 'SINTETICA'));
          setStatusDrafts({});
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar as ocorrências.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOccurrences();

    return () => {
      active = false;
    };
  }, [refreshKey, squareId, user, filters, isManager]);

  function handleStatusChange(id, status) {
    setStatusDrafts((current) => ({
      ...current,
      [id]: status,
    }));

    setFeedback('');
    setError('');
  }

  async function handleUpdateStatus(occurrence) {
    if (!isManager) {
      setError('Somente gestores podem atualizar os status.');
      return;
    }

    const newStatus =
      statusDrafts[occurrence.id] ?? occurrence.status;

    if (newStatus === occurrence.status) {
      setFeedback('O status selecionado já está aplicado.');
      setError('');
      return;
    }

    setUpdatingId(occurrence.id);
    setError('');
    setFeedback('');

    try {
      const updatedOccurrence = await updateOccurrenceStatus(
        occurrence.id,
        newStatus
      );

      setOccurrences((current) =>
        current.map((item) =>
          item.id === occurrence.id ? updatedOccurrence : item
        )
      );

      setStatusDrafts((current) => {
        const next = { ...current };
        delete next[occurrence.id];
        return next;
      });

      setFeedback(
        `Status da ocorrência #${occurrence.id} atualizado com sucesso.`
      );
      onOccurrenceUpdated?.();
    } catch (err) {
      setError(
        err.message || 'Não foi possível atualizar o status.'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="occurrence-list-section" id="ocorrencias">
      <div className="occurrence-list-heading">
        <span className="section-label">
          04 — ACOMPANHAMENTO
        </span>

        <h2>{isManager ? 'Registros recentes.' : user ? 'Meus relatos.' : 'Acompanhamento.'}</h2>

        <p>
          {isManager
            ? 'Consulte as ocorrências registradas para os espaços públicos cadastrados no PraçaSegura.'
            : user
              ? 'Acompanhe apenas os relatos que você registrou.'
              : 'Entre na sua conta para ver seu dashboard e acompanhar seus registros.'}
        </p>

      </div>

      {loading && (
        <p role="status">Carregando ocorrências...</p>
      )}

      {!loading && error && (
        <p role="alert">{error}</p>
      )}

        {!loading && !error && user && occurrences.length === 0 && (
        <p>{isManager ? 'Nenhuma ocorrência registrada até o momento.' : 'Você ainda não tem relatos neste filtro.'}</p>
      )}

      {feedback && (
        <p role="status">{feedback}</p>
      )}

      {!loading && !error && occurrences.length > 0 && (
        <div className="occurrence-list-grid">
          {occurrences.map((occurrence) => {
            const selectedStatus =
              statusDrafts[occurrence.id] ??
              occurrence.status ??
              'REGISTRADA';

            const isUpdating = updatingId === occurrence.id;

            return (
              <article
                className="occurrence-card"
                key={occurrence.id}
              >
                <div className="occurrence-card-top">
                  <span className="occurrence-category">
                    {occurrence.category}
                  </span>

                  {occurrence.origin === 'SINTETICA' && (
                    <span className="occurrence-origin-badge">DADO SINTÉTICO · DEMONSTRAÇÃO</span>
                  )}

                  <span className="occurrence-status">
                    {getStatusLabel(occurrence.status)}
                  </span>
                </div>

                <h3>
                  {occurrence.square?.name ||
                    'Praça não identificada'}
                </h3>

                <p className="occurrence-location">
                  {occurrence.square?.neighborhood ||
                    'Bairro não informado'}
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

                {isManager && (
                  <div className="occurrence-status-editor">
                    <label htmlFor={`status-${occurrence.id}`}>
                      Atualizar status
                    </label>

                    <select
                      id={`status-${occurrence.id}`}
                      value={selectedStatus}
                      onChange={(event) =>
                        handleStatusChange(
                          occurrence.id,
                          event.target.value
                        )
                      }
                      disabled={isUpdating}
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(occurrence)}
                      disabled={
                        isUpdating ||
                        selectedStatus === occurrence.status
                      }
                    >
                      {isUpdating ? 'Salvando...' : 'Salvar status'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!user && !loading && (
        <p>
          <Link to="/login">
            Entre na sua conta
          </Link>
          {' '}para acessar o dashboard e acompanhar suas próprias ocorrências.
        </p>
      )}

      </section>
  );
}

export default OccurrenceList;
