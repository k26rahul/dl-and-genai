import { Routes, Route, Link } from 'react-router-dom'
import GradientDescentStepByStep from './from-gemini/gradient-descent-step-by-step.jsx'
import GradientDescent3D from './from-gemini/3-d-gradient-descent-partial-derivatives.jsx'
import GradientDescent5D from './from-gemini/gradient-descent-in-5-dimensions.jsx'
import InsideMLP from './from-gemini/inside-the-multi-layer-perceptron.jsx'
import './App.css'

const visualizations = [
  {
    id: 'gradient-descent-step-by-step',
    path: '/gradient-descent-step-by-step',
    title: 'Gradient Descent: Step by Step',
    description:
      'Drag a point along a curve and watch the math compute the next position. Explore how learning rate impacts convergence.',
    icon: '📉',
    tag: 'Calculus · Optimization',
    gradient: 'grad-blue',
  },
  {
    id: '3d-gradient-descent',
    path: '/3d-gradient-descent',
    title: '3D Gradient Descent',
    description:
      'Explore partial derivatives on a live 3D surface. Two inputs, one output — rotate, drag, and descend in real time.',
    icon: '🌄',
    tag: 'Partial Derivatives · Three.js',
    gradient: 'grad-purple',
  },
  {
    id: 'gradient-descent-5d',
    path: '/gradient-descent-5d',
    title: 'Gradient Descent in 5 Dimensions',
    description:
      "Optimize 5 parameters simultaneously. When we can't plot the surface, we follow the loss curve downward.",
    icon: '🔭',
    tag: 'High Dimensions · Loss Curve',
    gradient: 'grad-teal',
  },
  {
    id: 'inside-mlp',
    path: '/inside-mlp',
    title: 'Inside the Multi-Layer Perceptron',
    description:
      'Watch a 2-layer neural network learn in real time — forward pass, BCE loss, backpropagation, and weight updates.',
    icon: '🧠',
    tag: 'Neural Networks · Backprop',
    gradient: 'grad-amber',
  },
]

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

function HomePage() {
  return (
    <div className="home-root">
      {/* Hero */}
      <header className="home-hero">
        <div className="home-hero-inner">
          <div className="home-badge">Deep Learning & GenAI</div>
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
        <p>
          Made with React · Vite · Three.js &amp; lots of math
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/gradient-descent-step-by-step"
        element={
          <>
            <BackButton />
            <GradientDescentStepByStep />
          </>
        }
      />
      <Route
        path="/3d-gradient-descent"
        element={
          <>
            <BackButton />
            <GradientDescent3D />
          </>
        }
      />
      <Route
        path="/gradient-descent-5d"
        element={
          <>
            <BackButton />
            <GradientDescent5D />
          </>
        }
      />
      <Route
        path="/inside-mlp"
        element={
          <>
            <BackButton />
            <InsideMLP />
          </>
        }
      />
    </Routes>
  )
}
