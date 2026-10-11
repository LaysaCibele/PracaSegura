
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  function handleSubmit(event) {
    event.preventDefault();

    alert(
      'A autenticação será implementada quando conectarmos o backend.'
    );
  }

  return (
    <main className="login-page">
      <Link to="/" className="login-back-link">
        ← Voltar para o início
      </Link>

      <section className="login-panel">
        <div className="login-intro">
          <span className="login-eyebrow">
            PRAÇAS · PESSOAS · CIDADE
          </span>

          <h1>
            A cidade também é sua.
          </h1>

          <p>
            Entre para acompanhar ocorrências, contribuir
            com informações e participar do cuidado com
            os espaços públicos do Recife.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-heading">
            <span className="section-label">
              ÁREA DE ACESSO
            </span>

            <h2>Boas-vindas.</h2>

            <p>Informe seus dados para continuar.</p>
          </div>

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
          />

          <button type="submit" className="login-submit">
            Entrar <span aria-hidden="true">↗</span>
          </button>

          <p className="login-demo-note">
            A entrada ainda não está conectada ao sistema
            de autenticação.
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;