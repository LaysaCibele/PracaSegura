import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getOccurrences, updateOccurrenceStatus } from '../../services/occurrenceService';
import OccurrenceList from './OccurrenceList';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock('../../services/occurrenceService', () => ({
  getOccurrences: jest.fn(),
  updateOccurrenceStatus: jest.fn(),
}));

const squares = [
  { id: 1, name: 'Praça Um', neighborhood: 'Centro' },
  { id: 2, name: 'Praça Dois', neighborhood: 'Boa Vista' },
];

const records = [
  { id: 1, category: 'Iluminação', description: 'Registro A', status: 'REGISTRADA', square: squares[0], createdAt: '2026-01-01T10:00:00' },
  { id: 2, category: 'Limpeza', description: 'Registro B', status: 'REGISTRADA', square: squares[1], createdAt: '2026-01-02T10:00:00' },
];

beforeEach(() => {
  getOccurrences.mockResolvedValue(records);
  updateOccurrenceStatus.mockReset();
});

test('citizen sees only their own records without edit controls', async () => {
  getOccurrences.mockResolvedValue([records[0]]);

  render(
    <OccurrenceList
      user={{ id: 3, role: 'CIDADAO' }}
      refreshKey={0}
      squareId=""
    />
  );

  expect(await screen.findByRole('heading', { name: 'Meus relatos.' })).toBeInTheDocument();
  expect(await screen.findByText('Registro A')).toBeInTheDocument();
  expect(screen.queryByText('Registro B')).not.toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
  expect(screen.queryByText('Atualizar status')).not.toBeInTheDocument();
});

test('loads the selected plaza filter from the API', async () => {
  render(
    <OccurrenceList
      user={{ id: 3, role: 'CIDADAO' }}
      refreshKey={0}
      squareId="2"
    />
  );

  await waitFor(() => expect(getOccurrences).toHaveBeenCalledWith({ squareId: '2' }));
});

test('hides synthetic records from citizens', async () => {
  getOccurrences.mockResolvedValue([{ ...records[0], origin: 'SINTETICA' }]);
  render(<OccurrenceList user={{ id: 3, role: 'CIDADAO' }} refreshKey={0} squareId="" />);
  expect(await screen.findByText('Você ainda não tem relatos neste filtro.')).toBeInTheDocument();
  expect(screen.queryByText('DADO SINTÉTICO · DEMONSTRAÇÃO')).not.toBeInTheDocument();
});

test('manager can select and save a new occurrence status', async () => {
  updateOccurrenceStatus.mockResolvedValue({ ...records[0], status: 'EM_ANALISE' });

  render(
    <OccurrenceList
      user={{ id: 4, role: 'GESTOR' }}
      refreshKey={0}
      squareId=""
    />
  );

  await screen.findAllByLabelText('Atualizar status');
  const statusSelect = screen.getAllByLabelText('Atualizar status')[0];
  const saveButton = screen.getAllByRole('button', { name: 'Salvar status' })[0];
  expect(saveButton).toBeDisabled();

  fireEvent.change(statusSelect, { target: { value: 'EM_ANALISE' } });
  expect(saveButton).toBeEnabled();
  fireEvent.click(saveButton);

  await waitFor(() => expect(updateOccurrenceStatus).toHaveBeenCalledWith(1, 'EM_ANALISE'));
});
