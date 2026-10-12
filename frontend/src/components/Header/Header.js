// Header é o componente que vai trazer a marca e a navegação do site
import './Header.css';
import { Link } from 'react-router-dom';

function Header({ user, loadingUser, onLogout }) {
  return (
    <header className="site-header">
      <Link className="site-brand" to="/" aria-label="PraçaSegura - página inicial">
        <span className="brand-symbol" aria-hidden="true">
          p.
        </span>

        <span className="brand-copy">
          <strong>PraçaSegura</strong>
          <small>RECIFE · ESPAÇOS PÚBLICOS</small>
        </span>
      </Link>

      <nav className="main-navigation" aria-label="Navegação principal">
        <Link to="/">Praças</Link>
        <Link to="/ocorrencias">Ocorrências</Link>
        {user?.role === 'GESTOR' && <Link to="/gestao">Gestão</Link>}
      </nav>

      <div className="header-account">
        {!loadingUser && user ? (
          <>
            <span className="header-user-name">{user.name}</span>
            <button type="button" className="header-logout" onClick={onLogout}>
              Sair
            </button>
          </>
        ) : !loadingUser ? (
          <Link className="header-login" to="/login">
            Entrar <span aria-hidden="true">↗</span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
