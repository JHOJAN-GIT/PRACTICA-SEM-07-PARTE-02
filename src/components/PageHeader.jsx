// PageHeader.jsx — Cabecera de página con título, subtítulo y descripción del sistema

export default function PageHeader() {
  return (
    <header className="page-header" role="banner">
      <div className="page-header-inner">
        <div className="page-header-text">
          <h1 className="page-header-title">
            Dashboard de Gestión de Estudiantes
          </h1>
          <p className="page-header-subtitle">
            Universidad Nacional del Centro del Perú — Facultad de Ingeniería de Sistemas
          </p>
          <p className="page-header-desc">
            Registra, filtra y ordena estudiantes por curso, nota y estado académico.
            Los datos se persisten automáticamente en tu navegador.
          </p>
        </div>
        <div className="page-header-badge" aria-hidden="true">
          <span className="badge-curso">IS093A</span>
          <span className="badge-semana">Semana 07 · Parte 2</span>
        </div>
      </div>
    </header>
  );
}
