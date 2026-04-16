import { Routes, Route, Link } from 'react-router-dom'
import visualizations from './visualizations'
import './App.css'

function BackButton() {
  return (
    <div className="viz-back-btn-wrapper">
      <Link to="/" className="viz-back-btn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        All Visualizations
      </Link>
    </div>
  )
}

function VizRoute({ viz }) {
  const Component = viz.component
  return (
    <>
      <BackButton />
      <Component />
    </>
  )
}

function HomePage() {
  return (
    <div className="home-root">
      {/* Hero */}
      <header className="home-hero">
        <div className="home-hero-inner">
          <div className="home-badge">Deep Learning &amp; GenAI</div>
          <h1 className="home-title">
            Interactive
            <br />
            <span className="home-title-accent">Visualizations</span>
          </h1>
          <p className="home-subtitle">
            Explore the math behind deep learning through hands-on, animated
            visualizations. Built to make the abstract concrete.
          </p>
        </div>
        <div className="home-hero-glow" aria-hidden="true" />
      </header>

      {/* Cards */}
      <main className="home-grid-wrapper">
        <div className="home-grid">
          {visualizations.map((viz, i) => (
            <Link
              key={viz.id}
              to={viz.path}
              className={`viz-card ${viz.gradient}`}
              style={{ '--card-index': i }}
            >
              <div className="viz-card-shine" aria-hidden="true" />
              <div className="viz-card-icon">{viz.icon}</div>
              <div className="viz-card-content">
                <span className="viz-card-tag">{viz.tag}</span>
                <h2 className="viz-card-title">{viz.title}</h2>
                <p className="viz-card-desc">{viz.description}</p>
              </div>
              <div className="viz-card-arrow">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="home-footer">
        <p>Made with React · Vite · Three.js &amp; lots of math</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {visualizations.map((viz) => (
        <Route key={viz.id} path={viz.path} element={<VizRoute viz={viz} />} />
      ))}
    </Routes>
  )
}
