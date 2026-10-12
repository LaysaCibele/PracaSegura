import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Login from './Login';
import { login } from '../../services/authService';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
}));

jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

test('notifies the application after successful login', async () => {
  const authenticatedUser = { id: 9, name: 'Gestora', role: 'GESTOR' };
  const onAuthenticated = jest.fn();
  login.mockResolvedValue(authenticatedUser);

  render(<Login onAuthenticated={onAuthenticated} />);
  fireEvent.change(screen.getByLabelText('E-mail'), {
    target: { value: 'gestora@example.test' },
  });
  fireEvent.change(screen.getByLabelText('Senha'), {
    target: { value: 'senha-segura' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Entrar/ }));

  await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(authenticatedUser));
});
