import './OccurrenceFilters.css';

const categories = ['Iluminação', 'Segurança', 'Infraestrutura', 'Vandalismo', 'Limpeza', 'Acessibilidade', 'Outro'];
const statuses = [
  ['REGISTRADA', 'Registrada'],
  ['EM_ANALISE', 'Em análise'],
  ['EM_ANDAMENTO', 'Em andamento'],
  ['RESOLVIDA', 'Resolvida'],
];

function OccurrenceFilters({ value, onChange }) {
  const filters = value || {};
  const update = (event) => onChange({ ...filters, [event.target.name]: event.target.value });

  return (
    <section className="occurrence-filters" aria-label="Filtros das ocorrências">
      <label>De <input type="date" name="from" value={filters.from || ''} onChange={update} /></label>
      <label>Até <input type="date" name="to" value={filters.to || ''} onChange={update} /></label>
      <label>Categoria
        <select name="category" value={filters.category || ''} onChange={update}>
          <option value="">Todas</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label>Status
        <select name="status" value={filters.status || ''} onChange={update}>
          <option value="">Todos</option>
          {statuses.map(([status, label]) => <option key={status} value={status}>{label}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => onChange({ from: '', to: '', category: '', status: '' })}>Limpar filtros</button>
    </section>
  );
}

export default OccurrenceFilters;
