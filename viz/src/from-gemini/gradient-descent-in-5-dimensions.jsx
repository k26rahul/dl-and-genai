import React, { useState, useEffect, useRef } from 'react';

// Mathematical Functions for 5D surfaces
const functions = [
  {
    id: 'sphere',
    name: 'Shifted Sphere (Simple 5D Bowl)',
    // Global minimum at [1, -2, 0, 2, -1], Min Z = 0
    f: p =>
      Math.pow(p[0] - 1, 2) +
      Math.pow(p[1] + 2, 2) +
      Math.pow(p[2] - 0, 2) +
      Math.pow(p[3] - 2, 2) +
      Math.pow(p[4] + 1, 2),
    grad: p => [
      2 * (p[0] - 1),
      2 * (p[1] + 2),
      2 * (p[2] - 0),
      2 * (p[3] - 2),
      2 * (p[4] + 1),
    ],
    domain: [-5, 5],
  },
  {
    id: 'elliptic',
    name: 'Elliptic Valley (Unequal Weights)',
    // Different parameters have different sensitivities (steeper in some dimensions)
    // Global minimum at [0, 1, -1, 3, 0], Min Z = 5
    f: p =>
      2 * Math.pow(p[0], 2) +
      0.5 * Math.pow(p[1] - 1, 2) +
      3 * Math.pow(p[2] + 1, 2) +
      Math.pow(p[3] - 3, 2) +
      1.5 * Math.pow(p[4], 2) +
      5,
    grad: p => [4 * p[0], 1 * (p[1] - 1), 6 * (p[2] + 1), 2 * (p[3] - 3), 3 * p[4]],
    domain: [-5, 5],
  },
];

const learningRates = [0.001, 0.01, 0.05, 0.1, 0.2, 0.5];

export default function App() {
  const [selectedFuncIdx, setSelectedFuncIdx] = useState(0);
  const currentFunc = functions[selectedFuncIdx];

  // State: 5 parameters (X1 to X5)
  const [params, setParams] = useState([3, 3, 3, 3, 3]);
  const [learningRate, setLearningRate] = useState(0.1);

  // Tracking progress
  const [epoch, setEpoch] = useState(0);
  const [history, setHistory] = useState([
    { epoch: 0, z: currentFunc.f([3, 3, 3, 3, 3]) },
  ]);

  // Playback state
  const [playMode, setPlayMode] = useState(0); // 0: paused, 1: 2 steps/s, 2: 4 steps/s
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);

  // Derived mathematical values
  const z = currentFunc.f(params);
  const grads = currentFunc.grad(params);

  // Reset entirely when function changes
  useEffect(() => {
    const initialParams = [3, 4, -3, 2, -4]; // Start at some random offset
    setParams(initialParams);
    setEpoch(0);
    setHistory([{ epoch: 0, z: currentFunc.f(initialParams) }]);
    setPlayMode(0);
  }, [selectedFuncIdx]);

  // Perform a step of gradient descent
  const handleStep = () => {
    const nextParams = params.map((p, i) => {
      const nextP = p - learningRate * grads[i];
      // Clamp to domain for visual stability
      return Math.max(currentFunc.domain[0], Math.min(currentFunc.domain[1], nextP));
    });

    const nextZ = currentFunc.f(nextParams);
    const nextEpoch = epoch + 1;

    setParams(nextParams);
    setEpoch(nextEpoch);
    setHistory(prev => [...prev, { epoch: nextEpoch, z: nextZ }]);
  };

  // Handle manual slider adjustment
  const handleManualChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    const newZ = currentFunc.f(newParams);

    setParams(newParams);

    // Reset Epoch and History when touched
    setEpoch(0);
    setHistory([{ epoch: 0, z: newZ }]);

    // Pause auto-play temporarily
    setIsInteracting(true);
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);

    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 500);
  };

  // Auto-play effect
  useEffect(() => {
    if (playMode === 0 || isInteracting) return;

    const delay = playMode === 1 ? 500 : 250;
    const timer = setTimeout(() => {
      handleStep();
    }, delay);

    return () => clearTimeout(timer);
  }, [playMode, isInteracting, params, epoch]);

  // Color & Arrow logic (Same as 2D/3D)
  const getDerivativeColor = slope => {
    const absM = Math.abs(slope);
    const intensity = Math.min(absM / 10, 1);
    if (Math.abs(slope) < 0.01) return 'rgb(156, 163, 175)'; // gray
    if (slope > 0) {
      return `rgb(${Math.round(150 * (1 - intensity))}, ${Math.round(180 + 75 * intensity)}, ${Math.round(150 * (1 - intensity))})`;
    } else {
      return `rgb(${Math.round(180 + 75 * intensity)}, ${Math.round(150 * (1 - intensity))}, ${Math.round(150 * (1 - intensity))})`;
    }
  };

  // SVG Chart Calculations
  const svgWidth = 600;
  const svgHeight = 250;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const maxEpoch = Math.max(10, ...history.map(h => h.epoch));
  const maxZ = Math.max(10, ...history.map(h => h.z));
  const minZ = Math.min(0, ...history.map(h => h.z));

  const mapEpochToX = e =>
    margin.left + (e / maxEpoch) * (svgWidth - margin.left - margin.right);
  const mapZToY = val =>
    svgHeight -
    margin.bottom -
    ((val - minZ) / (maxZ - minZ)) * (svgHeight - margin.top - margin.bottom);

  const pathData =
    history.length > 0
      ? history
          .map((h, i) => `${i === 0 ? 'M' : 'L'} ${mapEpochToX(h.epoch)} ${mapZToY(h.z)}`)
          .join(' ')
      : '';

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans'>
      <div className='max-w-7xl mx-auto'>
        <header className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            Gradient Descent in 5 Dimensions
          </h1>
          <p className='text-slate-600'>
            Visualizing optimization when we have too many parameters to plot a surface.
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* LEFT COLUMN: THE LOSS CURVE & CONTROLS */}
          <div className='lg:col-span-6 flex flex-col gap-6'>
            {/* The Loss Curve Plot */}
            <div className='bg-white p-4 rounded-2xl shadow-sm border border-slate-200'>
              <h2 className='text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 px-2'>
                Training Progress (Loss Curve)
              </h2>
              <div className='w-full overflow-x-auto flex justify-center bg-slate-50 rounded-xl border border-slate-100'>
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className='bg-transparent'
                >
                  {/* Grid Lines */}
                  <line
                    x1={margin.left}
                    y1={mapZToY(0)}
                    x2={svgWidth - margin.right}
                    y2={mapZToY(0)}
                    stroke='#e5e7eb'
                    strokeWidth='2'
                  />
                  <line
                    x1={margin.left}
                    y1={margin.top}
                    x2={margin.left}
                    y2={svgHeight - margin.bottom}
                    stroke='#e5e7eb'
                    strokeWidth='2'
                  />

                  {/* Axis Labels */}
                  <text
                    x={svgWidth / 2}
                    y={svgHeight - 5}
                    fontSize='12'
                    fill='#6b7280'
                    fontWeight='bold'
                    textAnchor='middle'
                  >
                    Epoch (Time)
                  </text>
                  <text
                    x={margin.left - 35}
                    y={svgHeight / 2}
                    fontSize='12'
                    fill='#6b7280'
                    fontWeight='bold'
                    transform={`rotate(-90, ${margin.left - 35}, ${svgHeight / 2})`}
                    textAnchor='middle'
                  >
                    Output (Z)
                  </text>

                  {/* Axis Ticks */}
                  <text
                    x={margin.left}
                    y={svgHeight - margin.bottom + 15}
                    fontSize='10'
                    fill='#9ca3af'
                    textAnchor='middle'
                  >
                    0
                  </text>
                  <text
                    x={svgWidth - margin.right}
                    y={svgHeight - margin.bottom + 15}
                    fontSize='10'
                    fill='#9ca3af'
                    textAnchor='middle'
                  >
                    {maxEpoch}
                  </text>
                  <text
                    x={margin.left - 5}
                    y={margin.top + 5}
                    fontSize='10'
                    fill='#9ca3af'
                    textAnchor='end'
                  >
                    {maxZ.toFixed(0)}
                  </text>

                  {/* The Curve */}
                  <path
                    d={pathData}
                    fill='none'
                    stroke='#3b82f6'
                    strokeWidth='3'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />

                  {/* Current Point */}
                  <circle
                    cx={mapEpochToX(epoch)}
                    cy={mapZToY(z)}
                    r='5'
                    fill='#ef4444'
                    stroke='#ffffff'
                    strokeWidth='2'
                  />
                </svg>
              </div>
              <div className='mt-4 flex justify-between px-2'>
                <div className='text-sm'>
                  <span className='text-slate-500 font-semibold'>Current Epoch:</span>{' '}
                  <span className='font-mono font-bold text-blue-600'>{epoch}</span>
                </div>
                <div className='text-sm'>
                  <span className='text-slate-500 font-semibold'>
                    Current Output (Z):
                  </span>{' '}
                  <span className='font-mono font-bold text-red-500'>{z.toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className='bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex flex-col gap-4'>
              <div className='flex flex-col sm:flex-row gap-4 items-end'>
                <div className='flex-1 w-full'>
                  <label className='block text-sm font-semibold text-indigo-900 mb-1'>
                    Learning Rate
                  </label>
                  <select
                    className='w-full bg-white border border-indigo-200 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 shadow-sm font-mono'
                    value={learningRate}
                    onChange={e => setLearningRate(Number(e.target.value))}
                  >
                    {learningRates.map(lr => (
                      <option key={lr} value={lr}>
                        {lr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex gap-2 w-full sm:w-auto'>
                  <button
                    onClick={handleStep}
                    disabled={playMode !== 0}
                    className={`flex-1 sm:flex-none text-white font-bold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 ${
                      playMode !== 0
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    Step
                  </button>
                  <button
                    onClick={() => setPlayMode(p => (p + 1) % 3)}
                    className={`flex-1 sm:flex-none font-bold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 text-white ${
                      playMode === 0
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : playMode === 1
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {playMode === 0 ? 'Auto-Play' : playMode === 1 ? 'Fast (2x)' : 'Stop'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: THE 5 PARAMETERS & EXPLANATION */}
          <div className='lg:col-span-6 flex flex-col gap-6'>
            {/* 5 Parameters Readout & Controls */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-200'>
              <div className='flex justify-between items-end border-b pb-3 mb-4'>
                <h2 className='text-sm font-bold text-slate-700 uppercase tracking-wide'>
                  Parameter Space (X1 - X5)
                </h2>
                <select
                  className='bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg block p-1.5'
                  value={selectedFuncIdx}
                  onChange={e => setSelectedFuncIdx(Number(e.target.value))}
                >
                  {functions.map((fn, idx) => (
                    <option key={fn.id} value={idx}>
                      {fn.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-5'>
                {params.map((val, i) => {
                  const m = grads[i];
                  const color = getDerivativeColor(m);
                  const arrowWidth = Math.min(60, 10 + Math.abs(m) * 5); // Compact arrow

                  return (
                    <div
                      key={i}
                      className='flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border border-slate-100'
                    >
                      <div className='flex justify-between items-center'>
                        <span className='font-bold text-slate-700 w-8'>
                          X<sub>{i + 1}</sub>
                        </span>
                        <input
                          type='range'
                          min={currentFunc.domain[0]}
                          max={currentFunc.domain[1]}
                          step='0.01'
                          value={val}
                          onChange={e =>
                            handleManualChange(i, parseFloat(e.target.value))
                          }
                          className='flex-1 mx-4 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600'
                        />
                        <span className='font-mono text-sm font-semibold w-12 text-right'>
                          {val.toFixed(2)}
                        </span>
                      </div>

                      <div className='flex justify-between items-center mt-2 px-2 text-xs'>
                        <span className='text-slate-500 font-semibold'>
                          ∂Z / ∂X<sub>{i + 1}</sub> ={' '}
                          <span style={{ color }} className='font-mono text-sm'>
                            {m > 0 ? '+' : ''}
                            {m.toFixed(2)}
                          </span>
                        </span>

                        <div className='h-4 flex items-center w-[80px] justify-end'>
                          {Math.abs(m) >= 0.01 ? (
                            <svg
                              width={arrowWidth}
                              height='12'
                              viewBox={`0 0 ${arrowWidth} 12`}
                              className='overflow-visible'
                            >
                              {m > 0 ? (
                                <g>
                                  <line
                                    x1='0'
                                    y1='6'
                                    x2={arrowWidth - 6}
                                    y2='6'
                                    stroke={color}
                                    strokeWidth='3'
                                    strokeLinecap='round'
                                  />
                                  <polygon
                                    points={`${arrowWidth},6 ${arrowWidth - 8},0 ${arrowWidth - 8},12`}
                                    fill={color}
                                  />
                                </g>
                              ) : (
                                <g>
                                  <line
                                    x1={arrowWidth}
                                    y1='6'
                                    x2='6'
                                    y2='6'
                                    stroke={color}
                                    strokeWidth='3'
                                    strokeLinecap='round'
                                  />
                                  <polygon points={`0,6 8,0 8,12`} fill={color} />
                                </g>
                              )}
                            </svg>
                          ) : (
                            <span className='text-slate-400 font-bold'>● Flat</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FULL WIDTH: EXPLANATION PANEL */}
          <div className='lg:col-span-12'>
            <div className='bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col gap-4'>
              <h3 className='font-bold text-blue-900 flex items-center gap-2 border-b border-blue-200 pb-2'>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                  ></path>
                </svg>
                Understanding Gradient Descent in Higher Dimensions
              </h3>

              <div className='text-sm text-blue-900 space-y-4'>
                <div className='space-y-2'>
                  <strong>1. Where did the Surface Plot go?</strong> The previous
                  visualizations had 1 or 2 inputs and 1 output, making 2D lines and 3D
                  surfaces. Here, we have <strong>5 inputs and 1 output</strong>. This
                  forms a mathematical surface in <strong>6-Dimensional space</strong>!
                  Since human brains cannot visualize 6D space, we cannot plot the
                  "surface" anymore.
                </div>

                <div className='space-y-2'>
                  <strong>2. The Epoch vs. Output Plot:</strong> Because we can't see the
                  6D landscape, we track our progress using a <strong>Loss Curve</strong>.
                  <ul className='list-disc pl-5 mt-2 space-y-1'>
                    <li>
                      The <strong>Y-axis</strong> is our Output (Z), which we want to
                      minimize.
                    </li>
                    <li>
                      The <strong>X-axis</strong> is the <strong>Epoch</strong> (each time
                      we take a step).
                    </li>
                  </ul>
                  As the algorithm runs, you will see the line drop, proving that we are
                  walking "downhill" in 6D space, even if we can't physically see the
                  hill!
                </div>

                <div className='bg-white p-3 rounded-lg border border-blue-100 shadow-sm space-y-2'>
                  <p>
                    <strong>3. The Math is Exactly the Same:</strong> It doesn't matter if
                    we have 2 parameters or 5 billion parameters (like modern AI models).
                    The mechanism generalizes perfectly:
                  </p>
                  <ul className='list-disc pl-5 space-y-2 text-slate-700'>
                    <li>
                      We calculate the <strong>partial derivative</strong> for every
                      single parameter.
                    </li>
                    <li>
                      <strong>
                        If a partial derivative is{' '}
                        <span className='font-semibold text-green-600'>Positive</span>:
                      </strong>{' '}
                      To go down toward the minimum, we move{' '}
                      <strong>backward (&#8592;)</strong> on that specific parameter.
                    </li>
                    <li>
                      <strong>
                        If a partial derivative is{' '}
                        <span className='font-semibold text-red-600'>Negative</span>:
                      </strong>{' '}
                      To go down toward the minimum, we keep moving{' '}
                      <strong>forward (&#8594;)</strong> on that specific parameter.
                    </li>
                    <li>
                      We update <strong>all 5 parameters simultaneously</strong> using the
                      exact same formula: <br />{' '}
                      <code className='bg-slate-100 px-1 rounded text-indigo-600 font-bold'>
                        X<sub>new</sub> = X<sub>current</sub> - (LearningRate × ∂Z/∂X)
                      </code>
                    </li>
                  </ul>
                </div>

                <div className='space-y-2'>
                  <strong>Try it yourself:</strong> Grab any slider and move it. You will
                  see the Epoch reset to 0, and the Loss Curve spike upward (because you
                  moved away from the minimum). Then, hit <strong>Auto-Play</strong> and
                  watch the algorithm automatically slide all 5 parameters back to their
                  perfect, optimal positions!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
