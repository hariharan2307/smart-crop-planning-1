import { useState } from 'react'
import CropCard from './components/CropCard'
import MetricCard from './components/MetricCard'
import NavSidebar from './components/NavSidebar'
import PageHeader from './components/PageHeader'
import PlannerForm from './components/PlannerForm'
import WeatherCard from './components/WeatherCard'
import { cropOptions, marketPrices, weather } from './data/farmData'
import './App.css'

const initialPlans = [
  {
    id: 1,
    crop: 'Rice',
    season: 'Kharif',
    landSize: 2.5,
    status: 'In progress',
    expectedHarvest: 'October',
  },
]

const navigation = [
  { id: 'overview', label: 'Overview', icon: '⌂' },
  { id: 'planner', label: 'Crop planner', icon: '＋' },
  { id: 'plans', label: 'My plans', icon: '▤' },
  { id: 'market', label: 'Market prices', icon: '↗' },
]

function App() {
  const [activePage, setActivePage] = useState('overview')
  const [plans, setPlans] = useState(initialPlans)
  const [notice, setNotice] = useState('')

  const addPlan = ({ crop, season, landSize }) => {
    const newPlan = {
      id: Date.now(),
      crop: crop.name,
      season,
      landSize: Number(landSize),
      status: 'Planned',
      expectedHarvest: crop.harvest,
    }

    setPlans((currentPlans) => [newPlan, ...currentPlans])
    setNotice(`${crop.name} plan saved to My plans.`)
    setActivePage('plans')
  }

  const pageTitle = navigation.find((item) => item.id === activePage)?.label ?? 'Overview'

  return (
    <div className="app-shell">
      <NavSidebar
        activePage={activePage}
        navigation={navigation}
        planCount={plans.length}
        onNavigate={(page) => {
          setNotice('')
          setActivePage(page)
        }}
      />

      <main className="main-content">
        <PageHeader title={pageTitle} />
        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}>
              ×
            </button>
          </div>
        )}

        {activePage === 'overview' && (
          <Overview
            planCount={plans.length}
            onCreatePlan={() => {
              setNotice('')
              setActivePage('planner')
            }}
            onAddPlan={addPlan}
          />
        )}
        {activePage === 'planner' && <CropPlanner onAddPlan={addPlan} />}
        {activePage === 'plans' && <MyPlans plans={plans} onCreatePlan={() => setActivePage('planner')} />}
        {activePage === 'market' && <MarketPrices />}
      </main>
    </div>
  )
}

function Overview({ planCount, onCreatePlan, onAddPlan }) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">MONDAY, JUNE 16, 2025</p>
          <h1>Good morning, Ahmad <span aria-hidden="true">🌱</span></h1>
          <p className="welcome-copy">Here’s what’s happening on your farm today.</p>
        </div>
        <button className="button button-primary" type="button" onClick={onCreatePlan}>
          <span aria-hidden="true">＋</span> Create crop plan
        </button>
      </section>

      <div className="metric-grid">
        <MetricCard icon="▤" label="Active crop plans" value={String(planCount)} change="Keep your season on track" />
        <MetricCard icon="⌁" label="Farm size" value="8.5 acres" change="Across 2 fields" />
        <MetricCard icon="↗" label="Market outlook" value="Favorable" change="3 crops trending up" />
      </div>

      <section className="content-grid overview-grid">
        <div className="section-panel recommendation-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PERSONALIZED FOR YOUR FARM</p>
              <h2>Recommended crops</h2>
            </div>
            <button className="text-button" type="button" onClick={onCreatePlan}>Build a plan <span aria-hidden="true">→</span></button>
          </div>
          <p className="section-description">Based on your soil, the season, and local market trends.</p>
          <div className="crop-list">
            {cropOptions.slice(0, 3).map((crop) => (
              <CropCard key={crop.name} crop={crop} onSelect={() => onAddPlan({ crop, season: 'Kharif', landSize: 1 })} />
            ))}
          </div>
        </div>
        <WeatherCard weather={weather} />
      </section>
    </>
  )
}

function CropPlanner({ onAddPlan }) {
  const [season, setSeason] = useState('Kharif')
  const [soilType, setSoilType] = useState('Loamy')
  const [landSize, setLandSize] = useState('2')
  const recommendations = cropOptions.filter(
    (crop) => crop.seasons.includes(season) && crop.soils.includes(soilType),
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    const crop = recommendations[0]
    if (crop) onAddPlan({ crop, season, landSize })
  }

  return (
    <section className="planner-layout">
      <div className="section-panel planner-form-panel">
        <p className="eyebrow">YOUR FARM, YOUR PLAN</p>
        <h2>Plan your next season</h2>
        <p className="section-description">Tell us a little about your field to see suitable crop ideas.</p>
        <PlannerForm
          landSize={landSize}
          season={season}
          soilType={soilType}
          onLandSizeChange={setLandSize}
          onSeasonChange={setSeason}
          onSoilTypeChange={setSoilType}
          onSubmit={handleSubmit}
        />
      </div>
      <div className="section-panel planner-results">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MATCHED TO YOUR DETAILS</p>
            <h2>Crop suggestions</h2>
          </div>
          <span className="result-count">{recommendations.length} matches</span>
        </div>
        {recommendations.length > 0 ? (
          <div className="crop-list">
            {recommendations.map((crop) => (
              <CropCard key={crop.name} crop={crop} onSelect={() => onAddPlan({ crop, season, landSize })} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">🌾</span>
            <h3>No exact match yet</h3>
            <p>Try another season or soil type to see more crop suggestions.</p>
          </div>
        )}
        <p className="data-note">Suggestions are indicative and should be confirmed with local agricultural guidance.</p>
      </div>
    </section>
  )
}

function MyPlans({ plans, onCreatePlan }) {
  return (
    <section className="section-panel plans-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR SEASON AT A GLANCE</p>
          <h2>My crop plans</h2>
        </div>
        <button className="button button-primary" type="button" onClick={onCreatePlan}>＋ New plan</button>
      </div>
      {plans.length > 0 ? (
        <div className="plan-list">
          {plans.map((plan) => (
            <article className="plan-row" key={plan.id}>
              <div className="crop-avatar" aria-hidden="true">{plan.crop.slice(0, 1)}</div>
              <div className="plan-main">
                <h3>{plan.crop}</h3>
                <p>{plan.season} season <span aria-hidden="true">·</span> {plan.landSize} acres</p>
              </div>
              <div className="plan-harvest">
                <span>Expected harvest</span>
                <strong>{plan.expectedHarvest}</strong>
              </div>
              <span className={`status-pill ${plan.status === 'In progress' ? 'status-active' : ''}`}>{plan.status}</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">🌱</span>
          <h3>Your plans will show up here</h3>
          <p>Create a crop plan to keep your season organized.</p>
          <button className="button button-primary" type="button" onClick={onCreatePlan}>Create your first plan</button>
        </div>
      )}
    </section>
  )
}

function MarketPrices() {
  return (
    <section className="section-panel market-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LOCAL MARKET SNAPSHOT</p>
          <h2>Crop price trends</h2>
        </div>
        <span className="data-badge">Illustrative data</span>
      </div>
      <p className="section-description">Example prices to help demonstrate the market view. Confirm current rates with your local mandi.</p>
      <div className="market-table-wrap">
        <table className="market-table">
          <thead>
            <tr><th scope="col">Crop</th><th scope="col">Market price</th><th scope="col">Trend</th><th scope="col">Outlook</th></tr>
          </thead>
          <tbody>
            {marketPrices.map((item) => (
              <tr key={item.crop}>
                <th scope="row">{item.crop}</th>
                <td>{item.price}</td>
                <td className={item.rising ? 'trend-up' : 'trend-steady'}>{item.trend}</td>
                <td>{item.outlook}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default App
