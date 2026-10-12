import { fireEvent, render, screen } from '@testing-library/react';
import SquareSelector from './SquareSelector';

test('allows selecting a plaza or all plazas', () => {
  const onChange = jest.fn();
  render(
    <SquareSelector
      squares={[{ id: 5, name: 'Praça do Arsenal' }]}
      squareId=""
      onChange={onChange}
    />
  );

  expect(screen.getByRole('option', { name: 'Todas as praças' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Praça selecionada'), { target: { value: '5' } });
  expect(onChange).toHaveBeenCalledWith('5');
});
