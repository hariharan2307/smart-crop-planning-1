function PageHeader({ title }) {
  return (
    <header className="page-header">
      <div className="breadcrumbs"><span>Farm workspace</span><span aria-hidden="true">/</span><strong>{title}</strong></div>
      <div className="header-actions">
        <span className="location-label"><span aria-hidden="true">⌖</span> Punjab, India</span>
        <span aria-hidden="true" className="icon-button notification-button">
          <span aria-hidden="true">♧</span>
          <span className="notification-dot" aria-hidden="true"></span>
        </span>
        <span className="header-date">June 16, 2025</span>
      </div>
    </header>
  )
}

export default PageHeader
