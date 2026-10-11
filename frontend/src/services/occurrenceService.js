const API_URL = '/api/occurrences';

export async function getOccurrences(squareId) {
  const url = squareId
    ? `${API_URL}?squareId=${squareId}`
    : API_URL;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Não foi possível carregar as ocorrências.');
  }

  return response.json();
}

export async function createOccurrence(occurrence) {
  const response = await fetch(
    `${API_URL}?squareId=${occurrence.squareId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: occurrence.category,
        description: occurrence.description,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Não foi possível registrar a ocorrência.');
  }

  return response.json();
}

export async function updateOccurrenceStatus(id, status) {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Não foi possível atualizar o status.');
  }

  return response.json();
}