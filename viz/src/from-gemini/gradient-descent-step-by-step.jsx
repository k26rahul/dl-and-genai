import React, { useState, useMemo, useEffect } from 'react';

// Define the mathematical functions for our visualization
const functions = [
  {
    id: 'convex',
    name: 'Convex Parabola (Simple Bowl)',
    f: x => x * x,
    df: x => 2 * x,
    domain: [-3, 3],
    range: [-1, 10],
  },
  {
    id: 'concave',
    name: 'Concave Parabola (Hill)',
    f: x => -x * x + 6,
    df: x => -2 * x,
    domain: [-3, 3],
    range: [-4, 7],
  },
  {
    id: 'polynomial',
    name: 'Polynomial (Local & Global Minima)',
    f: x => 0.25 * Math.pow(x, 4) + 0.3 * Math.pow(x, 3) - 1.5 * Math.pow(x, 2) + 2,
    df: x => 1.0 * Math.pow(x, 3) + 0.9 * Math.pow(x, 2) - 3.0 * x,
    domain: [-4, 3],
    range: [-3, 8],
  },
  {
    id: 'sinusoidal',
    name: 'Sinusoidal (Many Minima)',
    f: x => 2 * Math.sin(x) + 0.2 * x * x,
    df: x => 2 * Math.cos(x) + 0.4 * x,
    domain: [-6, 6],
    range: [-3, 10],
  },
];

const learningRates = [0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0];

export default function App() {
  const [selectedFuncIdx, setSelectedFuncIdx] = useState(0);
  const currentFunc = functions[selectedFuncIdx];

  // State for the slider (input X)
  const [x, setX] = useState(0);

  // State for learning rate
  const [learningRate, setLearningRate] = useState(0.1);

  // Reset X when function changes to start in the middle
  useEffect(() => {
    setX((currentFunc.domain[0] + currentFunc.domain[1]) / 2);
  }, [selectedFuncIdx, currentFunc.domain]);

  // Derived mathematical values for CURRENT position
  const y = currentFunc.f(x);
  const m = currentFunc.df(x); // The slope / derivative

  // Calculate the NEXT position based on gradient descent formula
  const [minX, maxX] = currentFunc.domain;
  const rawNextX = x - learningRate * m;
  // Clamp nextX to keep it within the visible graph domain
  const nextX = Math.max(minX, Math.min(maxX, rawNextX));
  const nextY = currentFunc.f(nextX);

  // Perform a gradient descent step
  const handleStep = () => {
    setX(nextX);
  };

  // Colors based on slope value
  const getDerivativeColor = slope => {
    const absM = Math.abs(slope);
    const intensity = Math.min(absM / 10, 1);

    if (Math.abs(slope) < 0.01) return 'rgb(156, 163, 175)'; // gray

    if (slope > 0) {
      const r = Math.round(150 * (1 - intensity));
      const g = Math.round(180 + 75 * intensity);
      const b = Math.round(150 * (1 - intensity));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const r = Math.round(180 + 75 * intensity);
      const g = Math.round(150 * (1 - intensity));
      const b = Math.round(150 * (1 - intensity));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const derivativeColor = getDerivativeColor(m);

  // --- SVG Plotting Logic ---
  const svgWidth = 600;
  const svgHeight = 400;
  const margin = 40;

  const mapX = val => {
    const [xMin, xMax] = currentFunc.domain;
    return margin + ((val - xMin) / (xMax - xMin)) * (svgWidth - 2 * margin);
  };

  const mapY = val => {
    const [yMin, yMax] = currentFunc.range;
    return svgHeight - margin - ((val - yMin) / (yMax - yMin)) * (svgHeight - 2 * margin);
  };

  // Generate path points for the function curve
  const pathData = useMemo(() => {
    const [xMin, xMax] = currentFunc.domain;
    const steps = 200;
    const dx = (xMax - xMin) / steps;
    let d = '';

    for (let i = 0; i <= steps; i++) {
      const curX = xMin + i * dx;
      const curY = currentFunc.f(curX);
      const px = mapX(curX);
      const py = mapY(curY);
      d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    }
    return d;
  }, [currentFunc]);

  // Tangent line coordinates
  const tangentLength = (currentFunc.domain[1] - currentFunc.domain[0]) * 0.15;
  const x1 = x - tangentLength;
  const y1 = y - m * tangentLength;
  const x2 = x + tangentLength;
  const y2 = y + m * tangentLength;

  // Arrow size logic
  const maxArrowWidth = 200;
  const baseArrowWidth = 20;
  const arrowWidth = Math.min(maxArrowWidth, baseArrowWidth + Math.abs(m) * 20);

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans'>
      <div className='max-w-6xl mx-auto'>
        <header className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            Gradient Descent: Step by Step
          </h1>
          <p className='text-slate-600'>
            See exactly how the math computes the next position on the curve.
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* LEFT COLUMN: GRAPH & CONTROLS */}
          <div className='lg:col-span-7 flex flex-col gap-6'>
            <div className='bg-white p-4 rounded-2xl shadow-sm border border-slate-200'>
              <div className='w-full overflow-x-auto flex justify-center'>
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className='bg-white'
                >
                  {/* Grid Lines */}
                  <line
                    x1={mapX(currentFunc.domain[0])}
                    y1={mapY(0)}
                    x2={mapX(currentFunc.domain[1])}
                    y2={mapY(0)}
                    stroke='#e5e7eb'
                    strokeWidth='2'
                  />
                  <line
                    x1={mapX(0)}
                    y1={mapY(currentFunc.range[0])}
                    x2={mapX(0)}
                    y2={mapY(currentFunc.range[1])}
                    stroke='#e5e7eb'
                    strokeWidth='2'
                  />

                  {/* Axis Labels */}
                  <text
                    x={svgWidth - margin + 10}
                    y={mapY(0) + 5}
                    fontSize='14'
                    fill='#6b7280'
                    fontWeight='bold'
                  >
                    X
                  </text>
                  <text
                    x={mapX(0) - 5}
                    y={margin - 10}
                    fontSize='14'
                    fill='#6b7280'
                    fontWeight='bold'
                    textAnchor='end'
                  >
                    Y
                  </text>

                  {/* Function Curve */}
                  <path
                    d={pathData}
                    fill='none'
                    stroke='#3b82f6'
                    strokeWidth='3'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />

                  {/* Tangent Line */}
                  <line
                    x1={mapX(x1)}
                    y1={mapY(y1)}
                    x2={mapX(x2)}
                    y2={mapY(y2)}
                    stroke='#94a3b8'
                    strokeWidth='2'
                    strokeDasharray='5,5'
                  />

                  {/* The Current Point (Solid Red Dot) */}
                  <circle
                    cx={mapX(x)}
                    cy={mapY(y)}
                    r='6'
                    fill='#ef4444'
                    stroke='#ffffff'
                    strokeWidth='2'
                  />

                  {/* The NEXT Point (Hollow Red Dot) */}
                  <circle
                    cx={mapX(nextX)}
                    cy={mapY(nextY)}
                    r='7'
                    fill='none'
                    stroke='#ef4444'
                    strokeWidth='2.5'
                    strokeDasharray='3,2'
                  />

                  {/* Helper line to X axis for current */}
                  <line
                    x1={mapX(x)}
                    y1={mapY(y)}
                    x2={mapX(x)}
                    y2={mapY(0)}
                    stroke='#ef4444'
                    strokeWidth='1'
                    strokeDasharray='3,3'
                    opacity='0.4'
                  />
                </svg>
              </div>

              {/* Interaction Slider */}
              <div className='mt-6 px-4'>
                <label className='flex justify-between text-sm font-semibold text-slate-700 mb-2'>
                  <span>Input Value (X) Slider</span>
                  <span className='text-blue-600 font-mono'>{x.toFixed(4)}</span>
                </label>
                <input
                  type='range'
                  min={currentFunc.domain[0]}
                  max={currentFunc.domain[1]}
                  step='0.001'
                  value={x}
                  onChange={e => setX(parseFloat(e.target.value))}
                  className='w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600'
                />
              </div>

              {/* Gradient Descent Controls & Computation */}
              <div className='mt-6 mx-4 p-5 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col gap-4'>
                <div className='flex flex-col sm:flex-row gap-4 items-end'>
                  <div className='flex-1 w-full'>
                    <label className='block text-sm font-semibold text-indigo-900 mb-1'>
                      Learning Rate (Step Size)
                    </label>
                    <select
                      className='w-full bg-white border border-indigo-200 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 shadow-sm font-mono'
                      value={learningRate}
                      onChange={e => setLearningRate(Number(e.target.value))}
                    >
                      {learningRates.map(lr => (
                        <option key={lr} value={lr}>
                          {lr}{' '}
                          {lr <= 0.01 ? '(Very Tiny)' : lr >= 2.5 ? '(Very Large)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleStep}
                    className='w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-2.5 px-6 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center gap-2'
                  >
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
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      ></path>
                    </svg>
                    Take a Step
                  </button>
                </div>

                {/* Dynamic Computation Display */}
                <div className='mt-2 bg-white p-4 rounded-lg border border-indigo-200 shadow-inner'>
                  <div className='text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>
                    Step Computation
                  </div>
                  <div className='font-mono text-[15px] text-slate-700 flex flex-col gap-2'>
                    <div className='flex flex-wrap items-center gap-x-2'>
                      <span>
                        X<sub>new</sub> =
                      </span>
                      <span className='font-semibold text-blue-700'>
                        X<sub>current</sub>
                      </span>
                      <span>- (</span>
                      <span className='font-semibold text-purple-600'>LR</span>
                      <span>×</span>
                      <span className='font-semibold' style={{ color: derivativeColor }}>
                        Derivative
                      </span>
                      <span>)</span>
                    </div>
                    <div className='w-full h-px bg-slate-100 my-1'></div>
                    <div className='flex flex-wrap items-center gap-x-2'>
                      <span>
                        X<sub>new</sub> =
                      </span>
                      <span className='font-semibold text-blue-700'>{x.toFixed(4)}</span>
                      <span>- (</span>
                      <span className='font-semibold text-purple-600'>
                        {learningRate}
                      </span>
                      <span>×</span>
                      <span className='font-semibold' style={{ color: derivativeColor }}>
                        {m < 0 ? `(${m.toFixed(4)})` : m.toFixed(4)}
                      </span>
                      <span>)</span>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-2 text-lg mt-1'>
                      <span>
                        X<sub>new</sub> =
                      </span>
                      <span className='font-bold text-red-500'>{nextX.toFixed(4)}</span>
                      {Math.abs(nextX - rawNextX) > 0.0001 && (
                        <span className='text-xs text-slate-400 font-sans ml-2'>
                          (Clamped to boundary)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR CONTROLS & INFO */}
          <div className='lg:col-span-5 flex flex-col gap-6'>
            {/* Function Selector */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-200'>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                Select Function Curve
              </label>
              <select
                className='w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5'
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

            {/* Readout Panel */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center'>
              <h2 className='text-lg font-bold text-slate-800 w-full border-b pb-2 mb-4'>
                Current Status
              </h2>

              <div className='grid grid-cols-2 gap-4 w-full mb-6'>
                <div className='bg-blue-50 p-3 rounded-lg text-center border border-blue-100'>
                  <div className='text-xs font-bold text-blue-600 uppercase tracking-wide'>
                    Current X
                  </div>
                  <div className='text-xl font-mono font-semibold text-blue-900'>
                    {x.toFixed(3)}
                  </div>
                </div>
                <div className='bg-slate-50 p-3 rounded-lg text-center border border-slate-100'>
                  <div className='text-xs font-bold text-slate-500 uppercase tracking-wide'>
                    Output (Y)
                  </div>
                  <div className='text-xl font-mono font-semibold text-slate-800'>
                    {y.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className='text-sm font-bold text-slate-500 uppercase tracking-wide mb-1'>
                Derivative (Slope)
              </div>
              <div
                className='text-5xl font-mono font-bold tracking-tighter mb-4 transition-colors duration-200'
                style={{ color: derivativeColor }}
              >
                {m > 0 ? '+' : ''}
                {m.toFixed(3)}
              </div>

              {/* The Arrow */}
              <div className='h-20 flex flex-col items-center justify-center w-full bg-slate-50 rounded-xl border border-slate-100'>
                {Math.abs(m) >= 0.01 ? (
                  <>
                    <svg
                      width={arrowWidth}
                      height='24'
                      viewBox={`0 0 ${arrowWidth} 24`}
                      className='overflow-visible transition-all duration-200'
                    >
                      {m > 0 ? (
                        <g>
                          <line
                            x1='0'
                            y1='12'
                            x2={arrowWidth - 10}
                            y2='12'
                            stroke={derivativeColor}
                            strokeWidth='6'
                            strokeLinecap='round'
                          />
                          <polygon
                            points={`${arrowWidth},12 ${arrowWidth - 14},4 ${arrowWidth - 14},20`}
                            fill={derivativeColor}
                          />
                        </g>
                      ) : (
                        <g>
                          <line
                            x1={arrowWidth}
                            y1='12'
                            x2='10'
                            y2='12'
                            stroke={derivativeColor}
                            strokeWidth='6'
                            strokeLinecap='round'
                          />
                          <polygon points={`0,12 14,4 14,20`} fill={derivativeColor} />
                        </g>
                      )}
                    </svg>
                    <span className='text-xs font-semibold text-slate-500 mt-2 text-center px-2'>
                      Steepest Ascent <br />
                      (Derivative points this way)
                    </span>
                  </>
                ) : (
                  <span className='text-sm font-bold text-slate-400'>
                    ● Flat (Local Minimum/Maximum)
                  </span>
                )}
              </div>
            </div>

            {/* Explanation Panel */}
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
                    d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                  ></path>
                </svg>
                Understanding Gradient Descent
              </h3>

              <div className='text-sm text-blue-900 space-y-4'>
                <p>
                  <strong>1. The Derivative (Slope):</strong> The slope of the tangent
                  line represents the <em>instantaneous rate of change</em> of our
                  function. This is our <strong>derivative</strong> value.
                </p>

                <div className='bg-white p-3 rounded-lg border border-blue-100 shadow-sm space-y-2'>
                  <p>
                    <strong>2. Finding the Minimum:</strong> Our goal is to reach the
                    lowest value of the function. The derivative tells us the function's
                    behavior as we move forward (&#8594;):
                  </p>
                  <ul className='list-disc pl-5 space-y-2 text-slate-700'>
                    <li>
                      If the slope is{' '}
                      <span className='font-semibold text-green-600'>Positive</span>, the
                      function value is increasing (&#8593;). To go down toward the
                      minimum, we must move backward <strong>(&#8592;)</strong>.
                    </li>
                    <li>
                      If the slope is{' '}
                      <span className='font-semibold text-red-600'>Negative</span>, the
                      function value is decreasing (&#8595;). To go down toward the
                      minimum, we must keep moving forward <strong>(&#8594;)</strong>.
                    </li>
                  </ul>
                </div>

                <p>
                  <strong>3. Taking a Step:</strong> How big of a step do we take? We
                  multiply the derivative by a <strong>Learning Rate</strong>.
                </p>

                <div className='bg-indigo-900 text-indigo-50 font-mono text-center p-3 rounded-lg text-[13px] sm:text-sm shadow-inner'>
                  Step = - (Learning Rate &times; Derivative)
                </div>

                <p>
                  Notice the <strong>negative sign</strong>! We take the negative of this
                  product because we want to move <em>opposite</em> to the slope. For a
                  positive slope, we want a decrease in X (&#8592;). For a negative slope,
                  we want an increase in X (&#8594;).
                </p>

                <div className='bg-white p-3 rounded-lg border border-blue-100 shadow-sm'>
                  <p className='font-semibold mb-2'>4. The Impact of Learning Rate:</p>
                  <ul className='list-disc pl-5 space-y-2 text-slate-700'>
                    <li>
                      <strong>Small Learning Rate:</strong> Safe, tiny steps. You will
                      carefully reach the minimum, but it might take many steps.
                    </li>
                    <li>
                      <strong>Large Learning Rate:</strong> Fast, huge steps. You risk
                      overshooting the minimum entirely and bouncing out of control!
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
