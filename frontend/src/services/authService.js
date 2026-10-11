
const API_URL = '/api/auth';

export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('E-mail ou senha inválidos.');
  }

  return response.json();
}

export async function register(name, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    throw new Error('Não foi possível criar a conta. Confira os dados.');
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/me`, {
    credentials: 'same-origin',
  });

  if (!response.ok) return null;

  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error('Não foi possível sair da conta.');
  }
}