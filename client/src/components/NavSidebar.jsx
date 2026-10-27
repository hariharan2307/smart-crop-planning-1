function NavSidebar({ activePage, navigation, planCount, onNavigate }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); onNavigate('overview') }}>
        <span className="brand-mark" aria-hidden="true">🌾</span>
        <span>Fieldwise<span className="brand-period">.</span></span>
      </a>

      <div className="farm-switcher">
        <span className="farm-avatar" aria-hidden="true">AF</span>
        <span className="farm-details"><strong>Ahmad&apos;s Farm</strong><small>Primary farm</small></span>
        <span className="switcher-arrow" aria-hidden="true">⌄</span>
      </div>

      <p className="nav-label">WORKSPACE</p>
      <nav className="primary-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            aria-current={activePage === item.id ? 'page' : undefined}
            className={`nav-item ${activePage === item.id ? 'nav-item-active' : ''}`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
            {item.id === 'plans' && <span className="nav-count">{planCount}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-tip">
        <span className="tip-icon" aria-hidden="true">✦</span>
        <strong>Grow with confidence</strong>
        <p>Good planning today makes for a better harvest tomorrow.</p>
      </div>

      <div className="profile-row">
        <span className="profile-avatar" aria-hidden="true">A</span>
        <span className="profile-details"><strong>Ahmad Farooq</strong><small>Farm owner</small></span>
        <span aria-hidden="true" className="profile-menu">···</span>
      </div>
    </aside>
  )
}

export default NavSidebar
