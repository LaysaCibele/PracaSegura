//apresentação principal do projeto


import './Hero.css';

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <span className="hero-eyebrow">
          CIDADE · PARTICIPAÇÃO · CUIDADO
        </span>

        <h1 id="hero-title">
          Toda praça conta uma história.
        </h1>

        <p className="hero-description">
          Conheça os espaços públicos do Recife, acompanhe
          suas condições e ajude a construir uma cidade
          mais acolhedora.
        </p>

        <div className="hero-actions">
          <a className="hero-button hero-button-primary" href="#pracas">
            Explorar praças <span aria-hidden="true">↗</span>
          </a>

          <a className="hero-button hero-button-secondary" href="#sobre">
            Como funciona
          </a>
        </div>

        <div className="hero-note">
          <span className="hero-note-line" aria-hidden="true" />
          <p>
            Um olhar atento sobre os lugares que fazem
            parte da vida da cidade.
          </p>
        </div>
      </div>

      <div className="hero-visual">
        <img
          className="hero-image"
          src="/images/praca-republica.png"
          alt="Área verde de uma praça pública com árvores e caminhos para caminhada"
        />

        <div className="hero-image-caption">
          <span>ESPAÇOS PÚBLICOS</span>
          <span>RECIFE, PE</span>
        </div>

        <span className="hero-image-index" aria-hidden="true">
          01 / CIDADE
        </span>
      </div>
    </section>
  );
}

export default Hero;