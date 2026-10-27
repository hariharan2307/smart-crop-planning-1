function WeatherCard({ weather }) {
  return (
    <section aria-label="Local weather" className="weather-card">
      <div className="weather-topline">
        <div>
          <p className="weather-overline">LOCAL WEATHER</p>
          <p className="weather-location">{weather.location}</p>
        </div>
        <span className="weather-sun" aria-hidden="true">☀</span>
      </div>
      <div className="weather-current">
        <strong>{weather.temperature}<sup>°</sup></strong>
        <span>{weather.condition}<small>Feels like {weather.feelsLike}°</small></span>
      </div>
      <div className="weather-divider"></div>
      <div className="weather-details">
        <div><span aria-hidden="true">◉</span><span>Humidity<strong>{weather.humidity}%</strong></span></div>
        <div><span aria-hidden="true">↗</span><span>Wind<strong>{weather.wind} km/h</strong></span></div>
        <div><span aria-hidden="true">⌁</span><span>Rain chance<strong>{weather.rainChance}%</strong></span></div>
      </div>
      <p className="weather-note">Illustrative forecast · check your local forecast</p>
    </section>
  )
}

export default WeatherCard
