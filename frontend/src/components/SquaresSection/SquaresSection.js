import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSquares } from '../../services/squareService';
import './SquaresSection.css';

const imagesByName = {
  'Praça da República': '/images/praca-republica.png',
};

function SquareImage({ square }) {
  const image = square.photoUrl || imagesByName[square.name];
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [image]);

  return (
    <div className="square-card-image">
      {image && !failed ? (
        <img src={image} alt={`Espaço público ${square.name}`} onError={() => setFailed(true)} />
      ) : (
        <div className="square-image-placeholder">
          <span aria-hidden="true">✳</span>
          <small>IMAGEM EM BREVE</small>
        </div>
      )}
      <span className="square-number">{String(square.id).padStart(2, '0')}</span>
    </div>
  );
}

function SquareCard({ square }) {
  return (
    <article className="square-card" key={square.id}>
      <SquareImage square={square} />
      <div className="square-card-content">
        <span className="square-type-badge">{square.type === 'PARQUE' ? 'Parque' : 'Praça'}</span>
        <span className="square-neighborhood">{square.neighborhood || 'Bairro não informado'} · RECIFE</span>
        <h3>{square.name}</h3>
        {square.area != null && (
          <p className="square-area">
            Área no cadastro oficial: {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(square.area)}
          </p>
        )}
        <p>{square.address ? `Endereço cadastrado: ${square.address}.` : 'Espaço público cadastrado no PraçaSegura.'}</p>
        <div className="square-card-footer">
          <span className="square-status"><span className="square-status-dot" aria-hidden="true" />Cadastro registrado</span>
          <Link to={`/pracas/${square.id}`} className="square-details-button">Ver detalhes ↗</Link>
        </div>
      </div>
    </article>
  );
}

function SquaresSection() {
  const [squares, setSquares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSquares() {
      try {
        setSquares(await getSquares());
      } catch {
        setError('Não foi possível carregar os espaços. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    loadSquares();
  }, []);

  return (
    <section className="squares-section" id="pracas">
      <div className="squares-heading">
        <div>
          <span className="section-label">02 — EXPLORAR A CIDADE</span>
          <h2>Espaços em foco.</h2>
          <p>Conheça praças e parques e consulte os dados disponíveis para cada espaço.</p>
        </div>
        <span className="squares-count">{String(squares.length).padStart(2, '0')} ESPAÇOS</span>
      </div>

      {loading && <p role="status">Carregando espaços...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && squares.length === 0 && <p>Nenhum espaço cadastrado no momento.</p>}

      {!loading && !error && squares.length > 0 && (
        <div className="squares-grid">
          {squares.map((square) => <SquareCard key={square.id} square={square} />)}
        </div>
      )}

      <p className="squares-disclaimer">
        O catálogo e as áreas exibidas vêm da fonte oficial Parques e Praças da Prefeitura do Recife. A área é apresentada conforme publicada; o cadastro não representa uma avaliação de segurança.
      </p>
    </section>
  );
}

export default SquaresSection;
