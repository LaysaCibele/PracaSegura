import './SquareSelector.css';

function SquareSelector({ squares, squareId, onChange }) {
  return (
    <div className="square-selector">
      <label htmlFor="square-selector">Praça selecionada</label>
      <select
        id="square-selector"
        value={squareId}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Todas as praças</option>
        {squares.map((square) => (
          <option key={square.id} value={square.id}>{square.name}</option>
        ))}
      </select>
    </div>
  );
}

export default SquareSelector;
