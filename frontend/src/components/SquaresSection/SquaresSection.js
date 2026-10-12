
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSquares } from '../../services/squareService';
import './SquaresSection.css';

const imagesByName = {
  'Praça da República': '/images/praca-republlica.png',
};

function SquareImage({ square }) {
  const image = square.photoUrl || imagesByName[square.name];
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [image]);

  return (
    <div className="square-card-image">
      {image && !failed ? (
        <img
          src={image}
          alt={`Praça ${square.name}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="square-image-placeholder">
          <span aria-hidden="true">✳</span>
          <small>IMAGEM EM BREVE</small>
        </div>
      )}

      <span className="square-number">
        {String(square.id).padStart(2, '0')}
      </span>
    </div>
  );
}

function SquaresSection() {
  const [squares, setSquares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSquares() {
      try {
        const data = await getSquares();
        setSquares(data);
      } catch (err) {
        setError('Não foi possível carregar as praças. Tente novamente.');
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
          <span className="section-label">
            02 — EXPLORAR A CIDADE
          </span>

          <h2>Praças em foco.</h2>

          <p>
            Conheça os espaços públicos e acompanhe
            as informações disponíveis sobre cada um.
          </p>
        </div>

        <span className="squares-count">
          {String(squares.length).padStart(2, '0')} ESPAÇOS
        </span>
      </div>

      {loading && (
        <p role="status">Carregando praças...</p>
      )}

      {!loading && error && (
        <p role="alert">{error}</p>
      )}

      {!loading && !error && squares.length === 0 && (
        <p>Nenhuma praça cadastrada no momento.</p>
      )}

      {!loading && !error && squares.length > 0 && (
        <div className="squares-grid">
          {squares.map((square) => {
            return (
              <article className="square-card" key={square.id}>
                <SquareImage square={square} />

                <div className="square-card-content">
                  <span className="square-neighborhood">
                    {square.neighborhood || 'Bairro não informado'} · RECIFE
                  </span>

                  <h3>{square.name}</h3>

                  <p>
                    {square.address
                      ? `Endereço cadastrado: ${square.address}.`
                      : 'Espaço público cadastrado no PraçaSegura.'}
                  </p>

                  <div className="square-card-footer">
                    <span className="square-status">
                      <span
                        className="square-status-dot"
                        aria-hidden="true"
                      />
                      Cadastro registrado
                    </span>

                    <Link to={`/pracas/${square.id}`} className="square-details-button">
                      Ver detalhes ↗
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="squares-disclaimer">
        Os registros exibidos vêm do banco de dados do sistema.
        O cadastro de uma praça não representa uma avaliação real de segurança.
      </p>
    </section>
  );
}

export default SquaresSection;
