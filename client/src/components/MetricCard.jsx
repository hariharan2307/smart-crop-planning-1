function MetricCard({ icon, label, value, change }) {
  return (
    <article className="metric-card">
      <div className="metric-card-top">
        <span className="metric-icon" aria-hidden="true">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-change">{change}</span>
    </article>
  )
}

export default MetricCard
