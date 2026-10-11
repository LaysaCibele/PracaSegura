
import './SquaresSection.css';

const squares = [
  {
    id: 1,
    name: 'Praça da República',
    neighborhood: 'Santo Antônio',
    description:
      'Um espaço histórico no centro do Recife, próximo ao Palácio do Campo das Princesas.',
    status: 'Monitoramento demonstrativo',
    image: '/images/praca-republlica.png',
  },
  {
    id: 2,
    name: 'Praça de Casa Forte',
    neighborhood: 'Casa Forte',
    description:
      'Um espaço de convivência conhecido pela área verde e pelo jardim central.',
    status: 'Dados a integrar',
    image: null,
  },
  {
    id: 3,
    name: 'Praça do Arsenal',
    neighborhood: 'Recife Antigo',
    description:
      'Uma praça na área histórica da cidade, cercada por construções e equipamentos culturais.',
    status: 'Dados a integrar',
    image: null,
  },
];

function SquaresSection() {
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
          03 ESPAÇOS
        </span>
      </div>

      <div className="squares-grid">
        {squares.map((square) => (
          <article className="square-card" key={square.id}>
            <div className="square-card-image">
              {square.image ? (
                <img src={square.image} alt={square.name} />
              ) : (
                <div className="square-image-placeholder">
                  <span aria-hidden="true">✳</span>
                  <small>IMAGEM EM BREVE</small>
                </div>
              )}

              <span className="square-number">
                0{square.id}
              </span>
            </div>

            <div className="square-card-content">
              <span className="square-neighborhood">
                {square.neighborhood} · RECIFE
              </span>

              <h3>{square.name}</h3>

              <p>{square.description}</p>

              <div className="square-card-footer">
                <span className="square-status">
                  <span
                    className="square-status-dot"
                    aria-hidden="true"
                  />
                  {square.status}
                </span>

                <button
                  type="button"
                  className="square-details-button"
                  onClick={() =>
                    alert(
                      `Detalhes de ${square.name} serão implementados na próxima etapa.`
                    )
                  }
                >
                  Ver detalhes ↗
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="squares-disclaimer">
        As informações exibidas nesta etapa são demonstrativas
        e ainda não representam uma avaliação real de segurança.
      </p>
    </section>
  );
}

export default SquaresSection;