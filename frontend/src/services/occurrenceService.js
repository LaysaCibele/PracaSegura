
const API_URL = '/api/occurrences';

function queryUrl(path, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value);
  });
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export async function getOccurrences(filters = {}) {
  const normalizedFilters = typeof filters === 'string' ? { squareId: filters } : filters;
  const url = queryUrl(API_URL, normalizedFilters);

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

export async function getOccurrenceStats(squareId, filters = {}) {
  const url = queryUrl(`${API_URL}/stats`, { ...filters, ...(squareId ? { squareId } : {}) });

  const response = await fetch(url, { credentials: 'same-origin' });

  if (!response.ok) {
    throw new Error('Não foi possível carregar as estatísticas.');
  }

  return response.json();
}
