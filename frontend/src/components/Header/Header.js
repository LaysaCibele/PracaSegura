// Header é o componente que vai trazer a marca e a navegação do site
import './Header.css';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="site-header">
      <a className="site-brand" href="/" aria-label="PraçaSegura - página inicial">
        <span className="brand-symbol" aria-hidden="true">
          p.
        </span>

        <span className="brand-copy">
          <strong>PraçaSegura</strong>
          <small>RECIFE · ESPAÇOS PÚBLICOS</small>
        </span>
      </a>

      <nav className="main-navigation" aria-label="Navegação principal">
        <a href="#sobre">O projeto</a>
        <a href="#pracas">Explorar praças</a>
        <a href="#participar">Participar</a>
      </nav>

      <Link className="header-login" to="/login">Entrar <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}

export default Header;