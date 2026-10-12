import { render, screen } from '@testing-library/react';
import { getSquareById } from '../../services/squareService';
import SquareDetails from './SquareDetails';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  useParams: () => ({ id: '4' }),
}));
jest.mock('../../services/squareService', () => ({
  getSquareById: jest.fn(),
}));
jest.mock('../../components/Dashboard/Dashboard', () => ({ squareId }) => (
  <div data-testid="square-dashboard" data-square-id={squareId} />
));
jest.mock('../../components/OccurrenceList/OccurrenceList', () => ({ squareId }) => (
  <div data-testid="square-occurrences" data-square-id={squareId} />
));
jest.mock('../../components/OccurrenceForm/OccurrenceForm', () => ({ fixedSquareId }) => (
  <div data-testid="square-occurrence-form" data-square-id={fixedSquareId} />
));
jest.mock('../../components/UrbanIndicators/UrbanIndicators', () => () => (
  <div data-testid="urban-indicators" />
));

const square = {
  id: 4,
  name: 'Parque da Jaqueira',
  neighborhood: 'Jaqueira',
  address: 'Rua do Futuro',
  description: 'Área pública',
  latitude: -8.03,
  longitude: -34.9,
};

function renderDetails(user = null) {
  return render(<SquareDetails user={user} refreshKey={0} />);
}

beforeEach(() => {
  getSquareById.mockResolvedValue(square);
});

test('carrega os dados e filtra indicadores e ocorrências pelo id da praça', async () => {
  renderDetails({ role: 'CIDADAO' });

  expect(await screen.findByRole('heading', { name: 'Parque da Jaqueira' })).toBeInTheDocument();
  expect(screen.getByTestId('square-dashboard')).toHaveAttribute('data-square-id', '4');
  expect(screen.getByTestId('square-occurrences')).toHaveAttribute('data-square-id', '4');
  expect(screen.getByTestId('square-occurrence-form')).toHaveAttribute('data-square-id', '4');
  expect(getSquareById).toHaveBeenCalledWith('4');
});

test('solicita autenticação antes de mostrar ocorrências', async () => {
  renderDetails();

  expect(await screen.findByText(/Entre na sua conta para consultar os registros/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Entrar ou criar conta/ })).toHaveAttribute('href', '/login');
  expect(screen.queryByTestId('square-occurrences')).not.toBeInTheDocument();
});
