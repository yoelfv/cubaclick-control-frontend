interface TopbarProps {
  title: string
  onMenuClick: () => void
}

function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="topbar">
      <button
        className="menu-button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <h1>{title}</h1>

      <div className="topbar-user">
        <span>Administradora</span>
        <span>Usuario</span>
      </div>
    </header>
  )
}

export default Topbar