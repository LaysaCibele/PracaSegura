
const API_URL = "/api/squares";

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });

  if (!response.ok) {
  const message = await response.text();

  console.error("Erro na API de praças:", {
    url,
    status: response.status,
    message,
  });

  throw new Error(
    `Erro ${response.status}: ${
      message || "Não foi possível concluir a operação."
    }`
  );
}

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getSquares() {
  return request(API_URL);
}

export async function getSquareById(id) {
  return request(`${API_URL}/${id}`);
}

export async function getSquareRecommendation(id) {
  return request(`${API_URL}/${id}/recommendation`);
}

export async function createSquare(square) {
  return request(API_URL, {
    method: "POST",
    body: JSON.stringify(square),
  });
}

export async function updateSquare(id, square) {
  return request(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(square),
  });
}

export async function deleteSquare(id) {
  return request(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
