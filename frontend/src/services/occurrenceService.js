
const API_URL = '/api/occurrences';

export async function getOccurrences(squareId) {
  const url = squareId
    ? `${API_URL}?squareId=${squareId}`
    : API_URL;

  const response = await fetch(url, { credentials: 'same-origin' });

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
      credentials: 'same-origin',
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
    credentials: 'same-origin',
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

export async function getOccurrenceStats(squareId) {
  const params = new URLSearchParams();

  if (squareId) {
    params.set('squareId', squareId);
  }

  const query = params.toString();
  const url = query
    ? `${API_URL}/stats?${query}`
    : `${API_URL}/stats`;

  const response = await fetch(url, { credentials: 'same-origin' });

  if (!response.ok) {
    throw new Error('Não foi possível carregar as estatísticas.');
  }

  return response.json();
}
