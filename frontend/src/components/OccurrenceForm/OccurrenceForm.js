
import { useEffect, useState } from 'react';
import { getSquares } from '../../services/squareService';
import { createOccurrence } from '../../services/occurrenceService';
import './OccurrenceForm.css';

const categories = [
  'Iluminação',
  'Infraestrutura',
  'Limpeza',
  'Segurança',
  'Acessibilidade',
  'Outro',
];

function OccurrenceForm({ onCreated }) {
  const [squares, setSquares] = useState([]);
  const [squareId, setSquareId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loadingSquares, setLoadingSquares] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadSquares() {
      try {
        const data = await getSquares();
        setSquares(data);
      } catch {
        setError('Não foi possível carregar as praças. Tente novamente.');
      } finally {
        setLoadingSquares(false);
      }
    }

    loadSquares();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!squareId || !category || !description.trim()) {
      setError('Preencha todos os campos antes de enviar.');
      return;
    }

    setSubmitting(true);

    try {
      await createOccurrence({
        squareId: Number(squareId),
        category,
          description: description.trim(),
      });

    setSuccess('Ocorrência registrada com sucesso!');
    setSquareId('');
    setCategory('');
    setDescription('');

if (onCreated) {
  onCreated();
}

      setSuccess('Ocorrência registrada com sucesso!');
      setCategory('');
      setDescription('');
    } catch (err) {
      setError(
        err.message || 'Não foi possível registrar a ocorrência.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="occurrence-section" id="registrar-ocorrencia">
      <div className="occurrence-heading">
        <span className="section-label">03 — PARTICIPE</span>
        <h2>Relate uma ocorrência.</h2>
        <p>
          Compartilhe informações sobre as condições dos espaços
          públicos para contribuir com seu monitoramento.
        </p>
      </div>

      <form className="occurrence-form" onSubmit={handleSubmit}>
        <div className="occurrence-field">
          <label htmlFor="occurrence-square">Praça</label>
          <select
            id="occurrence-square"
            value={squareId}
            onChange={(event) => setSquareId(event.target.value)}
            required
            disabled={loadingSquares || squares.length === 0}
          >
            <option value="">
              {loadingSquares
                ? 'Carregando praças...'
                : squares.length === 0
                  ? 'Nenhuma praça cadastrada'
                  : 'Selecione uma praça'}
            </option>

            {squares.map((square) => (
              <option key={square.id} value={square.id}>
                {square.name} — {square.neighborhood || 'Bairro não informado'}
              </option>
            ))}
          </select>
        </div>

        <div className="occurrence-field">
          <label htmlFor="occurrence-category">Categoria</label>
          <select
            id="occurrence-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="occurrence-field">
          <label htmlFor="occurrence-description">Descrição</label>
          <textarea
            id="occurrence-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva a situação observada..."
            maxLength={1000}
            rows={5}
            required
          />
          <small>{description.length}/1000 caracteres</small>
        </div>

        {error && (
          <p className="occurrence-feedback occurrence-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="occurrence-feedback occurrence-success" role="status">
            {success}
          </p>
        )}

        <button
          className="occurrence-submit"
          type="submit"
          disabled={submitting || loadingSquares || squares.length === 0}
        >
          {submitting ? 'Enviando...' : 'Registrar ocorrência ↗'}
        </button>

        <p className="occurrence-note">
          Registre apenas informações observadas. Este formulário não é um
          canal de atendimento emergencial.
        </p>
      </form>
    </section>
  );
}

export default OccurrenceForm;