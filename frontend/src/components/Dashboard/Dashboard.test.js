import { render, screen, waitFor } from '@testing-library/react';
import { getOccurrenceStats } from '../../services/occurrenceService';
import Dashboard from './Dashboard';

jest.mock('../../services/occurrenceService', () => ({
  getOccurrenceStats: jest.fn(),
}));

test('loads indicators for the selected plaza', async () => {
  getOccurrenceStats.mockResolvedValue({ total: 3, byStatus: [], byCategory: [] });

  render(<Dashboard refreshKey={0} squareId="12" />);

  await waitFor(() => expect(getOccurrenceStats).toHaveBeenCalledWith('12'));
  expect(await screen.findByText('3')).toBeInTheDocument();
});

test('formats normalized category labels for display', async () => {
  getOccurrenceStats.mockResolvedValue({
    total: 2,
    byStatus: [],
    byCategory: [{ label: 'iluminação', total: 2 }],
  });

  render(<Dashboard refreshKey={0} squareId="12" />);

  expect(await screen.findByText('Iluminação')).toBeInTheDocument();
  expect(screen.getAllByText('2')).toHaveLength(2);
});
