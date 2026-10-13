import { useEffect, useState } from 'react';
import { getOccurrenceStats } from '../../services/occurrenceService';
import './Dashboard.css';

const statusLabels = {
  REGISTRADA: 'Registrada',
  EM_ANALISE: 'Em análise',
  EM_ANDAMENTO: 'Em andamento',
  RESOLVIDA: 'Resolvida',
};

function BarGroup({ title, items = [] }) {
  const maximum = Math.max(1, ...items.map((item) => item.total));
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      {items.length ? (
        <ul className="dashboard-bars">
          {items.map((item) => (
            <li key={item.label}>
              <div className="dashboard-bar-label"><span>{statusLabels[item.label] || `${item.label.charAt(0).toLocaleUpperCase('pt-BR')}${item.label.slice(1)}`}</span><strong>{item.total}</strong></div>
              <div className="dashboard-bar-track"><span style={{ width: `${(item.total / maximum) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      ) : <p>Nenhuma ocorrência neste recorte.</p>}
    </div>
  );
}

function Dashboard({ refreshKey, squareId, filters }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadStats() {
      setStats(null);
      setLoading(true);
      setError('');
      try {
        const data = await getOccurrenceStats(squareId, filters);
        if (active) setStats(data);
      } catch (err) {
        if (active) setError(err.message || 'Erro ao carregar os indicadores.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStats();
    return () => { active = false; };
  }, [refreshKey, squareId, filters]);

  if (loading && !stats) return <section className="dashboard-section"><p>Carregando indicadores...</p></section>;
  if (error && !stats) return <section className="dashboard-section"><p role="alert">{error}</p></section>;
  if (!stats) return null;

  const rate = stats.validStatusDenominator > 0
    ? `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(stats.resolutionRate)}%`
    : '—';

  return (
    <section className="dashboard-section" id="dashboard">
      <div className="dashboard-heading">
        <span className="section-label">VISÃO OPERACIONAL</span>
        <h2>Indicadores de ocorrências</h2>
      </div>
      {error && <p role="alert">{error}</p>}

      <div className="dashboard-kpis">
        <article className="dashboard-total"><span>Ocorrências no recorte</span><strong>{stats.total}</strong></article>
        <article className="dashboard-total"><span>Categoria Segurança</span><strong>{stats.securityCategoryTotal ?? 0}</strong></article>
        <article className="dashboard-total"><span>Pendentes</span><strong>{stats.pending ?? 0}</strong></article>
        <article className="dashboard-total"><span>Resolvidas</span><strong>{stats.resolved ?? 0}</strong></article>
        <article className="dashboard-total">
          <span>Taxa de resolução</span>
          <strong>{rate}</strong>
          {stats.averageResolutionHours != null && <small>Média entre as resolvidas com datas: {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(stats.averageResolutionHours)} h</small>}
        </article>
      </div>

      <div className="dashboard-groups">
        <BarGroup title="Por status" items={stats.byStatus || []} />
        <BarGroup title="Por categoria" items={stats.byCategory || []} />
        <BarGroup title="Por mês de registro" items={stats.byMonth || []} />
      </div>

      <section className="dashboard-recommendations" aria-labelledby="dashboard-recommendations-title">
        <h3 id="dashboard-recommendations-title">Pontos para acompanhamento</h3>
        <div className="recommendation-grid">
          {(stats.recommendations || []).map((item, index) => (
            <article key={`${item.title}-${index}`}>
              <h4>{item.title}</h4>
              <p><strong>Evidência:</strong> {item.evidence}</p>
              <p><strong>Ação possível:</strong> {item.action}</p>
            </article>
          ))}
        </div>
      </section>

    </section>
  );
}

export default Dashboard;
