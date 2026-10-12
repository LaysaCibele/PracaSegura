
import { useEffect, useState } from 'react';
import { getOccurrenceStats } from '../../services/occurrenceService';
import './Dashboard.css';

function Dashboard({ refreshKey, squareId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setError('');

      try {
        const data = await getOccurrenceStats(squareId);

        if (active) {
          setStats(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Erro ao carregar o dashboard.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, [refreshKey, squareId]);

  if (loading && !stats) {
    return (
      <section className="dashboard-section">
        <p>Carregando estatísticas...</p>
      </section>
    );
  }

  if (error && !stats) {
    return (
      <section className="dashboard-section">
        <p role="alert">{error}</p>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="dashboard-section" id="dashboard">
      <div className="dashboard-heading">
        <span className="section-label">VISÃO GERAL</span>
        <h2>Dashboard de ocorrências</h2>
        <p>
          Acompanhe os registros e a distribuição das ocorrências.
        </p>
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="dashboard-total">
        <span>Total de ocorrências</span>
        <strong>{stats.total}</strong>
      </div>

      <div className="dashboard-groups">
        <div className="dashboard-card">
          <h3>Por status</h3>

          {stats.byStatus.length > 0 ? (
            <ul>
              {stats.byStatus.map((item) => (
                <li key={item.label}>
                  <span>{item.label.replaceAll('_', ' ')}</span>
                  <strong>{item.total}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma ocorrência registrada.</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Por categoria</h3>

          {stats.byCategory.length > 0 ? (
            <ul>
              {stats.byCategory.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.total}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma ocorrência registrada.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;