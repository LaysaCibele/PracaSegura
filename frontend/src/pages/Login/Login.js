
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register } from '../../services/authService';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await register(name, email, password);
      }

      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.message || 'Ocorreu um erro. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegistering((current) => !current);
    setError('');
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

          <h1>A cidade também é sua.</h1>

          <p>
            Entre para acompanhar ocorrências, contribuir
            com informações e participar do cuidado com
            os espaços públicos do Recife.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-heading">
            <span className="section-label">ÁREA DE ACESSO</span>

            <h2>
              {isRegistering ? 'Crie sua conta.' : 'Boas-vindas.'}
            </h2>

            <p>
              {isRegistering
                ? 'Preencha seus dados para participar.'
                : 'Informe seus dados para continuar.'}
            </p>
          </div>

          {isRegistering && (
            <>
              <label htmlFor="name">Nome completo</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
              />
            </>
          )}

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={150}
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder={
              isRegistering
                ? 'Mínimo de 8 caracteres'
                : 'Digite sua senha'
            }
            autoComplete={
              isRegistering ? 'new-password' : 'current-password'
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={isRegistering ? 8 : undefined}
            required
          />

          {error && (
            <p role="alert" className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? 'Aguarde...'
              : isRegistering
                ? 'Criar conta'
                : 'Entrar'}

            <span aria-hidden="true">↗</span>
          </button>

          <p className="login-demo-note">
            {isRegistering
              ? 'Ao criar a conta, você terá o perfil de cidadão.'
              : 'Ainda não tem uma conta?'}
          </p>

          <button
            type="button"
            className="login-mode-toggle"
            onClick={toggleMode}
          >
            {isRegistering
              ? 'Já tenho uma conta. Entrar'
              : 'Criar uma conta'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;