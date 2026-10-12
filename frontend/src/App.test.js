import { render, screen } from '@testing-library/react';
import Header from './components/Header/Header';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

test('shows role-appropriate page navigation', () => {
  render(<Header user={{ name: 'Gestora', role: 'GESTOR' }} loadingUser={false} />);

  expect(screen.getByRole('link', { name: 'Praças' })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: 'Ocorrências' })).toHaveAttribute('href', '/ocorrencias');
  expect(screen.getByRole('link', { name: 'Gestão' })).toHaveAttribute('href', '/gestao');
});
