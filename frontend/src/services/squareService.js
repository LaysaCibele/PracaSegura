
const API_URL = "/api/squares";

export async function getSquares() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Não foi possível carregar as praças.");
  }

  return response.json();
}

export async function createSquare(square) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(square),
  });

  if (!response.ok) {
    throw new Error("Não foi possível cadastrar a praça.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}