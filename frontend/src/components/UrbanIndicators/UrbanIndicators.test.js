import { render, screen } from '@testing-library/react';
import UrbanIndicators from './UrbanIndicators';

const spaces = [
  { source_key: 'recife:praca:casa-forte:casa-forte', name: 'Praça de Casa Forte', polygon_components: 3, identified_poles: 42, unidentified_records_inside: 0, duplicate_rows_collapsed: 0 },
  { source_key: 'recife:praca:boa-viagem:boa-viagem', name: 'Praça de Boa Viagem', polygon_components: 1, identified_poles: 18, unidentified_records_inside: 0, duplicate_rows_collapsed: 40 },
  { source_key: 'recife:praca:derby:derby', name: 'Praça do Derby', polygon_components: 2, identified_poles: 147, unidentified_records_inside: 0, duplicate_rows_collapsed: 80 },
  { source_key: 'recife:parque:jaqueira:jaqueira', name: 'Parque da Jaqueira', polygon_components: 1, identified_poles: 227, unidentified_records_inside: 0, duplicate_rows_collapsed: 68 },
];

const report = {
  generated_at_utc: '2026-10-13T17:00:00Z',
  datasets: [{
    source: 'postes',
    spaces,
    metadata: {
      publisher: 'EMLURB',
      last_data_update_on_portal: '2026-03-04',
      dataset_page: 'https://dados.recife.pe.gov.br/dataset/postes-iluminacao-publica-do-recife',
    },
  }],
};

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => report });
});

afterEach(() => jest.restoreAllMocks());

test.each([
  ['Praça de Casa Forte', '42'],
  ['Praça de Boa Viagem', '18'],
  ['Praça do Derby', '147'],
  ['Parque da Jaqueira', '227'],
])('mostra os IDs de postes distintos em %s', async (squareName, count) => {
  render(<UrbanIndicators squareName={squareName} />);
  expect(await screen.findByText(count, { selector: 'strong' })).toBeInTheDocument();
  expect(screen.getByText(/não confirma postes físicos únicos nem funcionamento/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /dados e licença ODbL/ })).toHaveAttribute(
    'href',
    'https://dados.recife.pe.gov.br/dataset/postes-iluminacao-publica-do-recife'
  );
});

test('usa a chave estável do espaço e informa quando não há polígono validado', async () => {
  render(<UrbanIndicators sourceKey="missing" squareName="Praça desconhecida" />);
  expect(await screen.findByText(/não foi possível validar uma correspondência/)).toBeInTheDocument();
});
