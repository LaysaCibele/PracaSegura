import { useEffect, useState } from 'react';
import { getSquareRecommendation } from '../../services/squareService';
import './SquareRecommendation.css';

function SquareRecommendation({ squareId, refreshKey }) {
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setRecommendation(null);
    setError(false);
    getSquareRecommendation(squareId)
      .then((data) => { if (active) setRecommendation(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [squareId, refreshKey]);

  return (
    <section className="square-recommendation" aria-labelledby="square-recommendation-title">
      <span className="section-label">RECOMENDAÇÃO DO SISTEMA</span>
      <h2 id="square-recommendation-title">Nível de recomendação</h2>
      {error ? <p role="status">Recomendação indisponível no momento.</p>
        : !recommendation ? <p role="status">Calculando recomendação...</p>
          : recommendation.score == null ? <p>{recommendation.label}</p>
            : <div className="square-recommendation-result">
              <strong>{recommendation.score}<small>/100</small></strong>
              <span>{recommendation.label}</span>
            </div>}
      {!error && recommendation?.score != null && <p className="square-recommendation-basis">Considera relatos resolvidos e registros da categoria Segurança.</p>}
    </section>
  );
}

export default SquareRecommendation;
