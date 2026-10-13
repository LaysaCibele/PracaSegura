import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Dashboard from '../../components/Dashboard/Dashboard';
import OccurrenceFilters from '../../components/OccurrenceFilters/OccurrenceFilters';
import OccurrenceForm from '../../components/OccurrenceForm/OccurrenceForm';
import OccurrenceList from '../../components/OccurrenceList/OccurrenceList';
import SquareRecommendation from '../../components/SquareRecommendation/SquareRecommendation';
import UrbanIndicators from '../../components/UrbanIndicators/UrbanIndicators';
import { getSquareById } from '../../services/squareService';
import './SquareDetails.css';

function SquareDetails({ user, refreshKey, onRefresh, filters, onFiltersChange }) {
  const { id } = useParams();
  const [square, setSquare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getSquareById(id)
      .then((data) => { if (active) setSquare(data); })
      .catch(() => { if (active) setError('Não foi possível carregar esta praça. Verifique se ela ainda está cadastrada.'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="square-details page-content"><p role="status">Carregando dados da praça...</p></div>;
  if (error || !square) {
    return (
      <div className="square-details page-content">
        <Link className="square-back-link" to="/">← Voltar às praças</Link>
        <p role="alert">{error || 'Praça não encontrada.'}</p>
      </div>
    );
  }

  const mapUrl = square.latitude != null && square.longitude != null
    ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(square.latitude)}&mlon=${encodeURIComponent(square.longitude)}#map=17/${encodeURIComponent(square.latitude)}/${encodeURIComponent(square.longitude)}`
    : null;

  return (
    <div className="square-details page-content">
      <Link className="square-back-link" to="/">← Voltar às praças</Link>

      <section className="square-detail-hero" aria-labelledby="square-title">
        {square.photoUrl ? (
          <img className="square-detail-photo" src={square.photoUrl} alt={`Vista de ${square.name}`} />
        ) : (
          <div className="square-detail-photo square-detail-photo-empty" aria-label="Imagem não cadastrada">PraçaSegura</div>
        )}
        <div className="square-detail-summary">
          <span className="section-label">DETALHES DO ESPAÇO</span>
          <h1 id="square-title">{square.name}</h1>
          <p className="square-detail-type">{square.type === 'PARQUE' ? 'Parque' : 'Praça'}</p>
          <p className="square-detail-neighborhood">{square.neighborhood || 'Bairro não informado'} · Recife</p>
          {square.address && <p>{square.address}</p>}
          {square.area != null && <p>Área no cadastro oficial: {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(square.area)} (unidade não informada pela fonte).</p>}
          {square.description && <p>{square.description}</p>}
          {mapUrl && <a className="square-map-link" href={mapUrl} target="_blank" rel="noreferrer">Ver localização no mapa ↗</a>}
        </div>
      </section>

      <section className="square-detail-records" aria-labelledby="square-occurrences-title">
        <div className="square-detail-section-heading">
          <span className="section-label">ACOMPANHAMENTO</span>
          <h2 id="square-occurrences-title">Resumo da praça</h2>
          <p>{user?.role === 'GESTOR'
            ? `Indicadores e ocorrências registradas em ${square.name}.`
            : `Acompanhe seus relatos registrados em ${square.name}.`}</p>
        </div>

        {user?.role !== 'GESTOR' && <SquareRecommendation squareId={square.id} refreshKey={refreshKey} />}

        {user ? (
          <>
            {user.role === 'GESTOR' && <OccurrenceFilters value={filters} onChange={onFiltersChange} />}
            {user.role === 'GESTOR' && <Dashboard refreshKey={refreshKey} squareId={String(square.id)} filters={filters} />}
            <OccurrenceList user={user} refreshKey={refreshKey} squareId={String(square.id)} filters={user.role === 'GESTOR' ? filters : undefined} onOccurrenceUpdated={onRefresh} />
            {user.role !== 'GESTOR' && (
              <>
                <OccurrenceForm user={user} onCreated={onRefresh} fixedSquareId={square.id} />
                <p className="square-report-link"><Link to="/ocorrencias">Acompanhar todas as suas ocorrências ↗</Link></p>
              </>
            )}
          </>
        ) : (
          <div className="square-auth-notice">
            <p>Entre na sua conta para consultar e registrar seus próprios relatos.</p>
            <Link to="/login">Entrar ou criar conta ↗</Link>
          </div>
        )}
      </section>

      {user?.role === 'GESTOR' && <UrbanIndicators squareName={square.name} sourceKey={square.sourceKey} />}

      <p className="square-detail-disclaimer">As informações exibidas refletem os cadastros disponíveis no sistema. Elas não constituem avaliação oficial de segurança.</p>
    </div>
  );
}

export default SquareDetails;
