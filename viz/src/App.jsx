import { Routes, Route, Link } from 'react-router-dom'
import visualizations from './visualizations'
import './App.css'

function VizRoute({ viz }) {
  const Component = viz.component
  return <Component />
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
        <p>Last Build: {import.meta.env.VITE_BUILD_TIME || 'In Development'}</p>
        <a
          href="https://github.com/k26rahul/dl-and-genai"
          target="_blank"
          rel="noopener noreferrer"
          className="home-footer-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          k26rahul/dl-and-genai
        </a>
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
