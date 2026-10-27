function CropCard({ crop, onSelect }) {
  return (
    <article className="crop-card">
      <div className={`crop-illustration crop-${crop.color}`} aria-hidden="true">{crop.icon}</div>
      <div className="crop-card-content">
        <div className="crop-title-row">
          <h3>{crop.name}</h3>
          <span className="match-badge">{crop.match}% match</span>
        </div>
        <p className="crop-summary">{crop.description}</p>
        <div className="crop-details">
          <span><small>Growing time</small><strong>{crop.duration}</strong></span>
          <span><small>Est. yield</small><strong>{crop.yield}</strong></span>
          <span><small>Market</small><strong className={crop.market === 'Rising' ? 'trend-up' : ''}>{crop.market}</strong></span>
        </div>
      </div>
      <button aria-label={`Add ${crop.name} to my plans`} className="crop-add-button" onClick={onSelect} type="button">
        <span aria-hidden="true">＋</span>
      </button>
    </article>
  )
}

export default CropCard
