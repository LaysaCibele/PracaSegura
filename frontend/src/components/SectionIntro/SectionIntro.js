// vai introduzir a proposta da plataforma


import './SectionIntro.css';

function SectionIntro() {
  return (
    <section className="section-intro" id="sobre">
      <div className="section-intro-heading">
        <span className="section-label">
          01 — SOBRE O PROJETO
        </span>

        <h2>
          Cuidar dos espaços públicos
          <br />
          começa por conhecê-los.
        </h2>
      </div>

      <div className="section-intro-content">
        <p>
          As praças fazem parte da vida da cidade.
          São lugares de encontro, descanso e convivência
          que merecem atenção.
        </p>

        <p>
          O PraçaSegura reúne informações sobre esses
          espaços, permite registrar ocorrências e ajuda
          a acompanhar condições que podem influenciar
          a segurança.
        </p>

        <span className="section-intro-note">
          DADOS · PARTICIPAÇÃO · ESPAÇO URBANO
        </span>
      </div>
    </section>
  );
}

export default SectionIntro;