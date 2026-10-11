
import { useEffect, useState } from 'react';
import { getSquares } from '../../services/squareService';
import './SquaresSection.css';

const imagesByName = {
  'Praça da República': '/images/praca-republlica.png',
};

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
            const image = imagesByName[square.name];

            return (
              <article className="square-card" key={square.id}>
                <div className="square-card-image">
                  {image ? (
                    <img src={image} alt={square.name} />
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

                    <button
                      type="button"
                      className="square-details-button"
                      onClick={() =>
                        alert(
                          `Praça: ${square.name}\n` +
                          `Bairro: ${square.neighborhood || 'Não informado'}\n` +
                          `Endereço: ${square.address || 'Não informado'}`
                        )
                      }
                    >
                      Ver detalhes ↗
                    </button>
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