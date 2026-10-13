import { render, screen, within } from '@testing-library/react';
import { getSquares } from '../../services/squareService';
import SquaresSection from './SquaresSection';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));
jest.mock('../../services/squareService', () => ({ getSquares: jest.fn() }));

test('shows plazas and parks together in one public-space list', async () => {
  getSquares.mockResolvedValue([
    { id: 1, name: 'Praça Um', type: 'PRACA', neighborhood: 'Centro' },
    { id: 2, name: 'Parque 13 de Maio', type: 'PARQUE', neighborhood: 'Santo Amaro' },
    { id: 3, name: 'Parque da Jaqueira', type: 'PARQUE', neighborhood: 'Jaqueira' },
  ]);

  render(<SquaresSection />);

  const links = await screen.findAllByRole('link', { name: 'Ver detalhes ↗' });
  const grid = links[0].closest('.squares-grid');
  expect(within(grid).getByText('Praça Um')).toBeInTheDocument();
  expect(within(grid).getByText('Parque 13 de Maio')).toBeInTheDocument();
  expect(within(grid).getByText('Parque da Jaqueira')).toBeInTheDocument();
  expect(within(grid).getAllByText('Parque')).toHaveLength(2);
  expect(screen.queryByRole('heading', { name: 'Parques' })).not.toBeInTheDocument();
});
