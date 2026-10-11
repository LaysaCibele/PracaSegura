// Vai ter as infos institucionais


import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer" id="participar">
      <div className="footer-main">
        <div className="footer-brand">
          <a
            className="site-brand footer-logo"
            href="/"
            aria-label="PraçaSegura - página inicial"
          >
            <span className="brand-symbol" aria-hidden="true">
              p.
            </span>

            <span className="brand-copy">
              <strong>PraçaSegura</strong>
              <small>RECIFE · ESPAÇOS PÚBLICOS</small>
            </span>
          </a>

          <p>
            Cuidar dos espaços públicos também é
            construir uma cidade melhor.
          </p>
        </div>

        <div className="footer-links">
          <span className="footer-label">NAVEGUE</span>
          <a href="#sobre">O projeto</a>
          <a href="#pracas">Explorar praças</a>
          <a href="/login">Área de acesso</a>
        </div>

        <div className="footer-about">
          <span className="footer-label">SOBRE A INICIATIVA</span>
          <p>
            Projeto desenvolvido com foco em dados,
            participação cidadã e análise de espaços
            públicos do Recife.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>PraçaSegura © {new Date().getFullYear()}</span>
        <span>Recife, Pernambuco, Brasil</span>
      </div>
    </footer>
  );
}

export default Footer;