import Icon from './Icon.jsx'

export default function Topbar({ title, sub, search, onSearch, searchPlaceholder = 'Buscar…' }) {
  return (
    <header className="topbar">
      <div className="topbar-titles">
        <h1 className="topbar-title">{title}</h1>
        {sub && <p className="topbar-sub">{sub}</p>}
      </div>
      {onSearch && (
        <label className="search">
          <Icon name="busca" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </label>
      )}
    </header>
  )
}
