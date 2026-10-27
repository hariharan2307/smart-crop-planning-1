function PlannerForm({
  landSize,
  season,
  soilType,
  onLandSizeChange,
  onSeasonChange,
  onSoilTypeChange,
  onSubmit,
}) {
  return (
    <form className="planner-form" onSubmit={onSubmit}>
      <label>
        Growing season
        <select onChange={(event) => onSeasonChange(event.target.value)} value={season}>
          <option value="Kharif">Kharif (Monsoon)</option>
          <option value="Rabi">Rabi (Winter)</option>
          <option value="Zaid">Zaid (Summer)</option>
        </select>
      </label>
      <label>
        Soil type
        <select onChange={(event) => onSoilTypeChange(event.target.value)} value={soilType}>
          <option value="Loamy">Loamy</option>
          <option value="Clay">Clay</option>
          <option value="Sandy">Sandy</option>
        </select>
      </label>
      <label>
        Field size (acres)
        <input
          max="500"
          min="0.1"
          onChange={(event) => onLandSizeChange(event.target.value)}
          required
          step="0.1"
          type="number"
          value={landSize}
        />
      </label>
      <button className="button button-primary planner-submit" type="submit">
        Save suggested plan <span aria-hidden="true">→</span>
      </button>
    </form>
  )
}

export default PlannerForm
