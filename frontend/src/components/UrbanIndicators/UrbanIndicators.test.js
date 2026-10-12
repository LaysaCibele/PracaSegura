import { render, screen } from '@testing-library/react';
import UrbanIndicators from './UrbanIndicators';

const report = {
  generated_at_utc: '2026-10-12T17:01:21.814486+00:00',
  place_polygon_components: { casa_forte: 3, boa_viagem: 1, derby: 2, jaqueira: 1 },
  datasets: [{
    source: 'postes',
    records_inside_place_polygons: { casa_forte: 42, boa_viagem: 58, derby: 227, jaqueira: 295 },
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
  ['Praça de Boa Viagem', '58'],
  ['Praça do Derby', '227'],
  ['Parque da Jaqueira', '295'],
])('mostra o recorte de iluminação correspondente a %s', async (squareName, count) => {
  render(<UrbanIndicators squareName={squareName} />);

  expect(await screen.findByText(count, { selector: 'strong' })).toBeInTheDocument();
  expect(screen.getByText(/não mede segurança/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /dados e licença ODbL/ })).toHaveAttribute(
    'href',
    'https://dados.recife.pe.gov.br/dataset/postes-iluminacao-publica-do-recife'
  );
});
