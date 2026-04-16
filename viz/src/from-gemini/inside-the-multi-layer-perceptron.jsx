import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. MATH & MATRIX UTILITIES (NumPy in JS)
// ==========================================

const randomGaussian = () => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const zeros = (rows, cols) =>
  Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));
const randomMatrix = (rows, cols, scale = 0.1) =>
  Array(rows)
    .fill(0)
    .map(() =>
      Array(cols)
        .fill(0)
        .map(() => randomGaussian() * scale),
    );

const matMul = (A, B) => {
  const result = zeros(A.length, B[0].length);
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < A[0].length; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
};

const transpose = A => A[0].map((_, colIndex) => A.map(row => row[colIndex]));

const addBias = (A, b) => A.map(row => row.map((val, j) => val + b[0][j]));

const relu = Z => Z.map(row => row.map(val => Math.max(0, val)));
const reluBackward = (dA, Z) =>
  dA.map((row, i) => row.map((val, j) => (Z[i][j] > 0 ? val : 0)));

const sigmoid = Z => Z.map(row => row.map(val => 1 / (1 + Math.exp(-val))));
const sigmoidBackward = (dA, Z) => {
  const s = sigmoid(Z);
  return dA.map((row, i) => row.map((val, j) => val * s[i][j] * (1 - s[i][j])));
};

const clip = (val, min, max) => Math.min(Math.max(val, min), max);

const bceLoss = (A, Y) => {
  let sum = 0;
  const n = Y.length;
  for (let i = 0; i < n; i++) {
    const a = clip(A[i][0], 1e-9, 1 - 1e-9);
    const y = Y[i][0];
    sum += y * Math.log(a) + (1 - y) * Math.log(1 - a);
  }
  return -sum / n;
};

const bceLossBackward = (A, Y) => {
  const n = Y.length;
  return A.map((row, i) => {
    const a = clip(row[0], 1e-9, 1 - 1e-9);
    const y = Y[i][0];
    return [(-y / a + (1 - y) / (1 - a)) / n];
  });
};

const updateParams = (W, dW, b, db, lr) => {
  const newW = W.map((row, i) => row.map((val, j) => val - lr * dW[i][j]));
  const newB = b.map((row, i) => row.map((val, j) => val - lr * db[i][j]));
  return { newW, newB };
};

const sumAxis0 = A => {
  const result = zeros(1, A[0].length);
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0].length; j++) {
      result[0][j] += A[i][j];
    }
  }
  return result;
};

// ==========================================
// 2. DATASET
// ==========================================
const X_DATA = [
  [3.0, 4.0, 2.0],
  [2.0, 3.5, 3.0],
  [4.0, 4.5, 1.0],
  [1.5, 3.0, 2.0],
  [5.0, 3.8, 3.0],
  [8.0, 7.5, 0.0],
  [10.0, 8.0, 1.0],
  [7.0, 7.0, 0.0],
  [12.0, 9.0, 0.0],
  [6.0, 7.2, 1.0],
];
const Y_DATA = [[0], [0], [0], [0], [0], [1], [1], [1], [1], [1]];

// ==========================================
// 3. UI COMPONENTS
// ==========================================

const MatrixView = ({ title, data }) => {
  if (!data)
    return (
      <div className='text-[10px] md:text-xs text-slate-400 italic p-1.5 md:p-2 border rounded border-slate-200 bg-slate-50'>
        Waiting for {title}...
      </div>
    );
  return (
    <div className='mb-2 md:mb-3 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full'>
      <div className='bg-slate-100 px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[11px] font-bold text-slate-700 border-b flex justify-between'>
        <span className='truncate mr-2'>{title}</span>
        <span className='font-normal text-slate-400 shrink-0'>
          ({data.length}x{data[0].length})
        </span>
      </div>
      <div className='overflow-x-auto max-h-32 md:max-h-40 p-1 custom-scrollbar'>
        <table className='text-[9px] md:text-[10px] font-mono w-full text-right border-collapse'>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className='border-b border-slate-50 hover:bg-slate-50'>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className={`px-1.5 py-0.5 md:px-2 md:py-1 ${Math.abs(val) < 1e-4 ? 'text-slate-300' : val > 0 ? 'text-blue-600' : 'text-red-600'}`}
                  >
                    {typeof val === 'number' ? val.toFixed(4) : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN APPLICATION
// ==========================================
export default function App() {
  const netRef = useRef({
    W1: randomMatrix(3, 4, 0.1),
    b1: zeros(1, 4),
    W2: randomMatrix(4, 1, 0.1),
    b2: zeros(1, 1),
    Z1: null,
    A1: null,
    Z2: null,
    A2: null,
    loss: null,
    dA2: null,
    dZ2: null,
    dW2: null,
    db2: null,
    dA1: null,
    dZ1: null,
    dW1: null,
    db1: null,
    epoch: 0,
  });

  const [snap, setSnap] = useState({ ...netRef.current });
  const [lossHistory, setLossHistory] = useState([]);
  const [learningRate, setLearningRate] = useState(0.1);

  // Playback: 0=Pause, 1=Normal, 2=Fast
  const [playMode, setPlayMode] = useState(0);
  const [phase, setPhase] = useState('idle');

  // Collapsible Panels State
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true); // Default true so the user knows it's there
  const [inspectorParty, setInspectorParty] = useState('layer1');

  const nextPhaseMap = {
    idle: 'forward',
    forward: 'loss',
    loss: 'backward',
    backward: 'update',
    update: 'forward',
  };

  // Execute a single step of the mathematical pipeline
  const runPhase = currentPhase => {
    const nn = netRef.current;

    if (currentPhase === 'forward') {
      nn.Z1 = addBias(matMul(X_DATA, nn.W1), nn.b1);
      nn.A1 = relu(nn.Z1);
      nn.Z2 = addBias(matMul(nn.A1, nn.W2), nn.b2);
      nn.A2 = sigmoid(nn.Z2);
    } else if (currentPhase === 'loss') {
      nn.loss = bceLoss(nn.A2, Y_DATA);
    } else if (currentPhase === 'backward') {
      nn.dA2 = bceLossBackward(nn.A2, Y_DATA);
      nn.dZ2 = sigmoidBackward(nn.dA2, nn.Z2);
      nn.dW2 = matMul(transpose(nn.A1), nn.dZ2);
      nn.db2 = sumAxis0(nn.dZ2);

      nn.dA1 = matMul(nn.dZ2, transpose(nn.W2));
      nn.dZ1 = reluBackward(nn.dA1, nn.Z1);
      nn.dW1 = matMul(transpose(X_DATA), nn.dZ1);
      nn.db1 = sumAxis0(nn.dZ1);
    } else if (currentPhase === 'update') {
      const u2 = updateParams(nn.W2, nn.dW2, nn.b2, nn.db2, learningRate);
      nn.W2 = u2.newW;
      nn.b2 = u2.newB;

      const u1 = updateParams(nn.W1, nn.dW1, nn.b1, nn.db1, learningRate);
      nn.W1 = u1.newW;
      nn.b1 = u1.newB;

      nn.epoch += 1;
      setLossHistory(prev => [...prev, { epoch: nn.epoch, loss: nn.loss }]);
    }

    setSnap({ ...nn });
  };

  const handleReset = () => {
    netRef.current = {
      W1: randomMatrix(3, 4, 0.1),
      b1: zeros(1, 4),
      W2: randomMatrix(4, 1, 0.1),
      b2: zeros(1, 1),
      Z1: null,
      A1: null,
      Z2: null,
      A2: null,
      loss: null,
      dA2: null,
      dZ2: null,
      dW2: null,
      db2: null,
      dA1: null,
      dZ1: null,
      dW1: null,
      db1: null,
      epoch: 0,
    };
    setSnap({ ...netRef.current });
    setLossHistory([]);
    setPlayMode(0);
    setPhase('idle');
  };

  const togglePlay = () => {
    setPlayMode(prev => {
      if (prev === 0) return 1;
      if (prev === 1) return 2;
      return 1;
    });
  };

  // Animation Engine
  useEffect(() => {
    if (playMode === 0) return;

    let timer;
    if (playMode === 1) {
      timer = setInterval(() => {
        setPhase(prevPhase => {
          const next = nextPhaseMap[prevPhase] || 'forward';
          runPhase(next);
          return next;
        });
      }, 800);
    } else if (playMode === 2) {
      setPhase('fast');
      timer = setInterval(() => {
        runPhase('forward');
        runPhase('loss');
        runPhase('backward');
        runPhase('update');
      }, 50);
    }

    return () => clearInterval(timer);
  }, [playMode, learningRate]);

  // SVG Configuration
  const svgW = 400;
  const svgH = 400;
  const inNodes = [
    { id: 'i1', x: 50, y: 100, label: 'X1' },
    { id: 'i2', x: 50, y: 200, label: 'X2' },
    { id: 'i3', x: 50, y: 300, label: 'X3' },
  ];
  const hidNodes = [
    { id: 'h1', x: 200, y: 50, label: 'H1' },
    { id: 'h2', x: 200, y: 150, label: 'H2' },
    { id: 'h3', x: 200, y: 250, label: 'H3' },
    { id: 'h4', x: 200, y: 350, label: 'H4' },
  ];
  const outNodes = [{ id: 'o1', x: 350, y: 200, label: 'Out' }];

  const getWeightColor = w =>
    `rgba(${w < 0 ? '239, 68, 68' : '59, 130, 246'}, ${Math.min(0.2 + Math.abs(w) / 2, 1)})`;
  const getWeightWidth = w => Math.max(1, Math.min(Math.abs(w) * 3, 6));

  const isFast = phase === 'fast';
  const svgKey = isFast ? 'fast' : `${phase}-${snap.epoch}`;

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-1 sm:p-2 md:p-4 font-sans'>
      <div className='max-w-7xl mx-auto'>
        {/* Compact Header */}
        <header className='mb-2 md:mb-4 text-center'>
          <h1 className='text-xl md:text-3xl font-bold text-slate-900 mb-0.5 md:mb-1'>
            Inside the Multi-Layer Perceptron
          </h1>
          <p className='text-[11px] md:text-base text-slate-600'>
            Visualizing Forward Propagation, Binary Cross-Entropy, and Backpropagation.
          </p>
        </header>

        {/* Global Grid Container for perfect mobile ordering & desktop layout */}
        <div className='flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-4 lg:gap-5 mb-3 md:mb-6'>
          {/* ========================================== */}
          {/* 1. TOP CONTROLS (Order 1, Span 12)           */}
          {/* ========================================== */}
          <div className='order-1 lg:col-span-12 bg-white p-2 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2 md:gap-4 items-center justify-between'>
            {/* Play & Reset */}
            <div className='flex gap-1.5 md:gap-3 items-center w-full sm:w-auto'>
              <button
                onClick={handleReset}
                className='flex-1 sm:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors'
              >
                Reset
              </button>
              <button
                onClick={togglePlay}
                className={`flex-1 sm:flex-none px-3 py-1.5 md:px-5 md:py-2 w-full sm:w-36 md:w-48 rounded-lg text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-1 md:gap-2 text-white shadow-sm ${
                  playMode === 0
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : playMode === 1
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {playMode === 0
                  ? '▶ Play'
                  : playMode === 1
                    ? '⏭ Speed Up'
                    : '⏮ Speed Down'}
              </button>
            </div>

            {/* Learning Rate */}
            <div className='flex gap-1.5 md:gap-2 items-center w-full sm:w-auto justify-between sm:justify-start'>
              <label className='text-xs md:text-sm font-semibold text-slate-600'>
                Learning Rate:
              </label>
              <select
                value={learningRate}
                onChange={e => setLearningRate(Number(e.target.value))}
                className='bg-slate-100 border border-slate-300 rounded px-1.5 py-1 md:px-2 md:py-1.5 text-xs md:text-sm font-mono shadow-inner'
              >
                <option value={0.01}>0.01</option>
                <option value={0.1}>0.10</option>
                <option value={0.2}>0.20</option>
                <option value={0.5}>0.50</option>
                <option value={0.8}>0.80</option>
                <option value={1.0}>1.00</option>
              </select>
            </div>

            {/* Epoch & Loss Readout */}
            <div className='flex items-center justify-center gap-3 md:gap-4 bg-slate-100 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-200 w-full lg:w-auto'>
              <div className='text-center'>
                <span className='text-slate-500 font-semibold uppercase tracking-wider text-[9px] md:text-[10px]'>
                  Epoch
                </span>
                <div className='font-mono text-base md:text-lg font-bold text-slate-800 leading-none mt-0.5 md:mt-1'>
                  {snap.epoch}
                </div>
              </div>
              <div className='w-px h-6 md:h-8 bg-slate-300'></div>
              <div className='text-center w-16 md:w-20'>
                <span className='text-slate-500 font-semibold uppercase tracking-wider text-[9px] md:text-[10px]'>
                  Mean Loss
                </span>
                <div className='font-mono text-base md:text-lg font-bold text-red-500 leading-none mt-0.5 md:mt-1'>
                  {snap.loss !== null ? snap.loss.toFixed(4) : '---'}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 2. NETWORK GRAPH (Order 2, Span 5)           */}
          {/* ========================================== */}
          <div className='order-2 lg:col-span-5 bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center relative overflow-hidden'>
            <h2 className='text-sm md:text-lg font-bold text-slate-800 mb-1 md:mb-2 w-full border-b pb-1 md:pb-2'>
              Architecture & Flow
            </h2>

            {/* Phase Status Badges */}
            <div className='absolute top-2 right-2 md:top-14 md:right-6 flex flex-col gap-0.5 md:gap-1 z-10 w-24 md:w-40'>
              <span
                className={`text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded transition-all truncate ${phase === 'forward' ? 'bg-blue-100 text-blue-700 ring-1 md:ring-2 ring-blue-400 scale-105' : 'text-slate-300 bg-white/80'}`}
              >
                1. Forward &rarr;
              </span>
              <span
                className={`text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded transition-all truncate ${phase === 'loss' ? 'bg-red-100 text-red-700 ring-1 md:ring-2 ring-red-400 scale-105' : 'text-slate-300 bg-white/80'}`}
              >
                2. Calc Loss
              </span>
              <span
                className={`text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded transition-all truncate ${phase === 'backward' ? 'bg-purple-100 text-purple-700 ring-1 md:ring-2 ring-purple-400 scale-105' : 'text-slate-300 bg-white/80'}`}
              >
                3. Backward &larr;
              </span>
              <span
                className={`text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded transition-all truncate ${phase === 'update' ? 'bg-emerald-100 text-emerald-700 ring-1 md:ring-2 ring-emerald-400 scale-105' : 'text-slate-300 bg-white/80'}`}
              >
                4. Update
              </span>
              {phase === 'fast' && (
                <span className='text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded bg-amber-100 text-amber-700 ring-1 md:ring-2 ring-amber-400 scale-105 text-center mt-1 animate-pulse truncate'>
                  Continuous
                </span>
              )}
            </div>

            {/* Responsive SVG Container */}
            <svg
              key={svgKey}
              viewBox={`0 0 ${svgW} ${svgH}`}
              className='w-full h-auto max-w-[400px] mt-2 md:mt-4'
            >
              {/* Connections W1 */}
              {inNodes.map((n1, i) =>
                hidNodes.map((n2, j) => {
                  const w = snap.W1[i][j];
                  return (
                    <g key={`w1-${i}-${j}`}>
                      <line
                        x1={n1.x}
                        y1={n1.y}
                        x2={n2.x}
                        y2={n2.y}
                        stroke={getWeightColor(w)}
                        strokeWidth={getWeightWidth(w)}
                        strokeLinecap='round'
                        opacity='0.5'
                      />
                      {phase === 'forward' && (
                        <circle r='4' fill='#3b82f6' opacity='0'>
                          <set attributeName='opacity' to='1' begin='0s' />
                          <animateMotion
                            path={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`}
                            begin='0s'
                            dur='0.4s'
                            fill='freeze'
                          />
                        </circle>
                      )}
                      {phase === 'backward' && (
                        <circle r='4' fill='#a855f7' opacity='0'>
                          <set attributeName='opacity' to='1' begin='0.4s' />
                          <animateMotion
                            path={`M ${n2.x} ${n2.y} L ${n1.x} ${n1.y}`}
                            begin='0.4s'
                            dur='0.4s'
                            fill='freeze'
                          />
                        </circle>
                      )}
                      {isFast && (
                        <>
                          <circle r='4' fill='#3b82f6'>
                            <animateMotion
                              path={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`}
                              dur='0.3s'
                              repeatCount='indefinite'
                            />
                          </circle>
                          <circle r='4' fill='#a855f7'>
                            <animateMotion
                              path={`M ${n2.x} ${n2.y} L ${n1.x} ${n1.y}`}
                              dur='0.3s'
                              repeatCount='indefinite'
                            />
                          </circle>
                        </>
                      )}
                    </g>
                  );
                }),
              )}

              {/* Connections W2 */}
              {hidNodes.map((n1, i) => {
                const w = snap.W2[i][0];
                return (
                  <g key={`w2-${i}-0`}>
                    <line
                      x1={n1.x}
                      y1={n1.y}
                      x2={outNodes[0].x}
                      y2={outNodes[0].y}
                      stroke={getWeightColor(w)}
                      strokeWidth={getWeightWidth(w)}
                      strokeLinecap='round'
                      opacity='0.5'
                    />
                    {phase === 'forward' && (
                      <circle r='4' fill='#3b82f6' opacity='0'>
                        <set attributeName='opacity' to='1' begin='0.4s' />
                        <animateMotion
                          path={`M ${n1.x} ${n1.y} L ${outNodes[0].x} ${outNodes[0].y}`}
                          begin='0.4s'
                          dur='0.4s'
                          fill='freeze'
                        />
                      </circle>
                    )}
                    {phase === 'backward' && (
                      <circle r='4' fill='#a855f7' opacity='0'>
                        <set attributeName='opacity' to='1' begin='0s' />
                        <animateMotion
                          path={`M ${outNodes[0].x} ${outNodes[0].y} L ${n1.x} ${n1.y}`}
                          begin='0s'
                          dur='0.4s'
                          fill='freeze'
                        />
                      </circle>
                    )}
                    {isFast && (
                      <>
                        <circle r='4' fill='#3b82f6'>
                          <animateMotion
                            path={`M ${n1.x} ${n1.y} L ${outNodes[0].x} ${outNodes[0].y}`}
                            dur='0.3s'
                            repeatCount='indefinite'
                          />
                        </circle>
                        <circle r='4' fill='#a855f7'>
                          <animateMotion
                            path={`M ${outNodes[0].x} ${outNodes[0].y} L ${n1.x} ${n1.y}`}
                            dur='0.3s'
                            repeatCount='indefinite'
                          />
                        </circle>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Nodes Layer 1 */}
              {inNodes.map(n => (
                <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r='16'
                    fill='#f8fafc'
                    stroke='#94a3b8'
                    strokeWidth='2'
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    fontSize='12'
                    fill='#475569'
                    textAnchor='middle'
                    fontWeight='bold'
                  >
                    {n.label}
                  </text>
                </g>
              ))}

              {/* Nodes Layer 2 */}
              {hidNodes.map(n => (
                <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r='16'
                    fill='#f0fdf4'
                    stroke='#22c55e'
                    strokeWidth='2'
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    fontSize='11'
                    fill='#166534'
                    textAnchor='middle'
                    fontWeight='bold'
                  >
                    ReLU
                  </text>
                  <rect
                    x={n.x - 6}
                    y={n.y - 24}
                    width='12'
                    height='6'
                    fill='#fbbf24'
                    stroke='#d97706'
                    strokeWidth='1'
                  />
                </g>
              ))}

              {/* Output Layer */}
              {outNodes.map(n => (
                <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r='18'
                    fill='#eff6ff'
                    stroke='#3b82f6'
                    strokeWidth='2'
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    fontSize='10'
                    fill='#1e3a8a'
                    textAnchor='middle'
                    fontWeight='bold'
                  >
                    Sigmoid
                  </text>
                  <rect
                    x={n.x - 6}
                    y={n.y - 26}
                    width='12'
                    height='6'
                    fill='#fbbf24'
                    stroke='#d97706'
                    strokeWidth='1'
                  />
                </g>
              ))}
            </svg>

            {/* Network Graph Legend */}
            <div className='mt-2 flex flex-wrap justify-center gap-2 md:gap-4 text-[9px] md:text-[11px] text-slate-500 border-t border-slate-100 pt-2 w-full'>
              <div className='flex items-center gap-1'>
                <div className='w-3 h-1 md:w-4 md:h-1.5 bg-blue-500 rounded-full opacity-60'></div>
                <span className='font-medium'>Pos Weight</span>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-3 h-1 md:w-4 md:h-1.5 bg-red-500 rounded-full opacity-60'></div>
                <span className='font-medium'>Neg Weight</span>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-3 h-1.5 md:w-3 md:h-2 bg-amber-400 border border-amber-600'></div>
                <span className='font-medium'>Biases</span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN WRAPPER                       */}
          {/* ========================================== */}
          <div className='order-3 lg:col-span-7 flex flex-col gap-2 md:gap-4 lg:gap-5'>
            {/* ========================================== */}
            {/* 3. COLLAPSIBLE DATA TABLE (Order 3)          */}
            {/* ========================================== */}
            <div className='bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-fit'>
              <div
                className='bg-slate-800 p-2.5 md:p-4 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors'
                onClick={() => setIsTableOpen(!isTableOpen)}
              >
                <h2 className='text-sm md:text-lg font-bold text-white flex items-center gap-2'>
                  <svg
                    className='w-4 h-4 md:w-5 md:h-5 text-blue-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M4 6h16M4 10h16M4 14h16M4 18h16'
                    ></path>
                  </svg>
                  Batch Predictions (10 Samples)
                </h2>
                <div className='text-slate-300 text-[10px] md:text-sm font-semibold'>
                  {isTableOpen ? '▲ Collapse' : '▼ Expand'}
                </div>
              </div>

              {isTableOpen && (
                <div className='p-2 md:p-4 overflow-x-auto custom-scrollbar max-h-64 lg:max-h-96 overflow-y-auto'>
                  <table className='w-full text-[10px] md:text-sm text-left min-w-[300px]'>
                    <thead className='text-[9px] md:text-[10px] text-slate-500 bg-slate-50 uppercase border-b border-slate-200'>
                      <tr>
                        <th className='px-2 py-1.5 md:px-3 md:py-2'>ID</th>
                        <th className='px-2 py-1.5 md:px-3 md:py-2'>Inputs (X)</th>
                        <th className='px-2 py-1.5 md:px-3 md:py-2 text-center text-blue-700 font-bold'>
                          Pred (A2)
                        </th>
                        <th className='px-2 py-1.5 md:px-3 md:py-2 text-center'>
                          True (Y)
                        </th>
                        <th className='px-2 py-1.5 md:px-3 md:py-2 text-right'>
                          BCE Error
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {X_DATA.map((x, i) => {
                        const pred = snap.A2 ? snap.A2[i][0] : null;
                        const trueY = Y_DATA[i][0];
                        let err = null;
                        let isCorrect = false;

                        if (pred !== null) {
                          const pClipped = clip(pred, 1e-9, 1 - 1e-9);
                          err = -(
                            trueY * Math.log(pClipped) +
                            (1 - trueY) * Math.log(1 - pClipped)
                          );
                          isCorrect = (pred >= 0.5 ? 1 : 0) === trueY;
                        }

                        const rowColor =
                          snap.epoch > 0 && pred !== null
                            ? isCorrect
                              ? 'bg-green-50/50'
                              : 'bg-red-50/50'
                            : '';

                        return (
                          <tr
                            key={i}
                            className={`border-b border-slate-100 font-mono text-[10px] md:text-[13px] ${rowColor}`}
                          >
                            <td className='px-2 py-1.5 md:px-3 md:py-2 text-slate-400'>
                              #{i}
                            </td>
                            <td className='px-2 py-1.5 md:px-3 md:py-2 text-slate-600 truncate'>
                              [{x.map(v => v.toFixed(1)).join(', ')}]
                            </td>
                            <td className='px-2 py-1.5 md:px-3 md:py-2 text-center font-bold text-blue-600'>
                              {pred === null ? '---' : pred.toFixed(4)}
                            </td>
                            <td className='px-2 py-1.5 md:px-3 md:py-2 text-center font-bold text-slate-800'>
                              {trueY}
                            </td>
                            <td className='px-2 py-1.5 md:px-3 md:py-2 text-right text-red-500'>
                              {err === null ? '---' : err.toFixed(4)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ========================================== */}
            {/* 4. LOSS CURVE (Order 4)                      */}
            {/* ========================================== */}
            <div className='bg-white p-2 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-200'>
              <h2 className='text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide mb-1 md:mb-2 px-1 md:px-2'>
                Global Training Trajectory (Loss vs Epochs)
              </h2>
              <div className='w-full flex justify-center bg-slate-50 rounded-lg md:rounded-xl border border-slate-100 overflow-hidden relative h-28 md:h-48'>
                <div
                  className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${phase === 'loss' ? 'bg-red-500/10' : 'opacity-0'}`}
                ></div>
                <svg
                  width='100%'
                  height='100%'
                  viewBox='0 0 800 200'
                  preserveAspectRatio='none'
                  className='bg-transparent'
                >
                  <line
                    x1='40'
                    y1='160'
                    x2='780'
                    y2='160'
                    stroke='#e5e7eb'
                    strokeWidth='2'
                  />
                  <line
                    x1='40'
                    y1='20'
                    x2='40'
                    y2='160'
                    stroke='#e5e7eb'
                    strokeWidth='2'
                  />
                  <text
                    x='400'
                    y='190'
                    fontSize='14'
                    fill='#9ca3af'
                    textAnchor='middle'
                    fontWeight='bold'
                  >
                    Epochs
                  </text>
                  <text
                    x='15'
                    y='90'
                    fontSize='14'
                    fill='#9ca3af'
                    textAnchor='middle'
                    fontWeight='bold'
                    transform='rotate(-90 15 90)'
                  >
                    BCE Loss
                  </text>
                  {lossHistory.length > 0 && (
                    <>
                      <text x='35' y='25' fontSize='12' fill='#9ca3af' textAnchor='end'>
                        {Math.max(0.8, ...lossHistory.map(h => h.loss)).toFixed(1)}
                      </text>
                      <text
                        x='780'
                        y='175'
                        fontSize='12'
                        fill='#9ca3af'
                        textAnchor='middle'
                      >
                        {Math.max(10, snap.epoch)}
                      </text>
                      <path
                        d={lossHistory
                          .map((h, i) => {
                            const maxEp = Math.max(10, snap.epoch);
                            const maxL = Math.max(0.8, ...lossHistory.map(hl => hl.loss));
                            const px = 40 + (h.epoch / maxEp) * 740;
                            const py = 160 - (h.loss / maxL) * 140;
                            return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
                          })
                          .join(' ')}
                        fill='none'
                        stroke='#ef4444'
                        strokeWidth='3'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 5. INSPECTOR (Order 5, Span 12)              */}
          {/* ========================================== */}
          <div className='order-5 lg:col-span-12 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
            <div
              className='bg-slate-800 p-2.5 md:p-4 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors'
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            >
              <h2 className='text-sm md:text-lg font-bold text-white flex items-center gap-2'>
                <svg
                  className='w-4 h-4 md:w-5 md:h-5 text-indigo-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z'
                  ></path>
                </svg>
                Parameter & Gradient Inspector (Debugger)
              </h2>
              <div className='text-slate-300 text-[10px] md:text-sm font-semibold'>
                {isInspectorOpen ? '▲ Collapse' : '▼ Expand'}
              </div>
            </div>

            {isInspectorOpen && (
              <div className='p-3 md:p-6 bg-slate-100 border-t border-slate-200'>
                <div className='mb-3 md:mb-4'>
                  <p className='text-[11px] md:text-sm text-slate-600 font-medium'>
                    Click a component in the flow chart below to trace its exact inputs,
                    derivatives, and update mechanics.
                  </p>
                </div>

                {/* FLOW CHART UI */}
                <div className='mb-4 md:mb-8 w-full overflow-x-auto pb-2 md:pb-4 custom-scrollbar bg-white p-2 md:p-4 rounded-lg md:rounded-xl shadow-sm border border-slate-200'>
                  <div className='flex items-center min-w-max justify-center gap-1'>
                    {[
                      {
                        id: 'input',
                        name: 'Input',
                        desc: 'Data',
                        clickable: false,
                        fwd: 'X',
                        bwd: '',
                      },
                      {
                        id: 'layer1',
                        name: 'Layer 1',
                        desc: 'W1, b1',
                        clickable: true,
                        fwd: 'Z1',
                        bwd: 'dZ1',
                      },
                      {
                        id: 'relu',
                        name: 'Activ 1',
                        desc: 'ReLU',
                        clickable: true,
                        fwd: 'A1',
                        bwd: 'dA1',
                      },
                      {
                        id: 'layer2',
                        name: 'Layer 2',
                        desc: 'W2, b2',
                        clickable: true,
                        fwd: 'Z2',
                        bwd: 'dZ2',
                      },
                      {
                        id: 'sigmoid',
                        name: 'Activ 2',
                        desc: 'Sigmoid',
                        clickable: true,
                        fwd: 'A2',
                        bwd: 'dA2',
                      },
                      { id: 'loss', name: 'Loss', desc: 'BCE', clickable: true },
                    ].map((stage, idx, arr) => (
                      <React.Fragment key={stage.id}>
                        <div
                          onClick={() => stage.clickable && setInspectorParty(stage.id)}
                          className={`w-20 md:w-28 flex flex-col items-center justify-center p-1 md:p-2 rounded-lg border-2 transition-all ${
                            !stage.clickable
                              ? 'bg-slate-50 border-slate-200 opacity-70'
                              : inspectorParty === stage.id
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm cursor-pointer scale-105'
                                : 'border-slate-200 bg-white hover:border-indigo-300 cursor-pointer'
                          }`}
                        >
                          <span
                            className={`text-[10px] md:text-[11px] font-bold text-center ${inspectorParty === stage.id ? 'text-indigo-700' : 'text-slate-700'}`}
                          >
                            {stage.name}
                          </span>
                          <span className='text-[8px] md:text-[9px] text-slate-500 text-center mt-0.5 md:mt-1'>
                            {stage.desc}
                          </span>
                        </div>

                        {idx < arr.length - 1 && (
                          <div className='flex flex-col items-center justify-center px-1 md:px-2 min-w-[40px] md:min-w-[55px]'>
                            <span className='text-[9px] md:text-[10px] font-bold text-blue-600 mb-[-2px] whitespace-nowrap'>
                              {stage.fwd} &rarr;
                            </span>
                            {stage.bwd ? (
                              <span className='text-[9px] md:text-[10px] font-bold text-purple-600 mt-[-2px] whitespace-nowrap'>
                                &larr; {stage.bwd}
                              </span>
                            ) : (
                              <span className='text-[9px] md:text-[10px] font-bold text-slate-300 mt-[-2px] whitespace-nowrap'>
                                &larr;
                              </span>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
                  {inspectorParty === 'layer1' && (
                    <>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                          Forward Pass
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          Z1 = X @ W1 + b1
                        </p>
                        <MatrixView title='X (Input Data)' data={X_DATA} />
                        <MatrixView title='W1 (Current Weights)' data={snap.W1} />
                        <MatrixView title='b1 (Current Biases)' data={snap.b1} />
                        <MatrixView title='Z1 (Output)' data={snap.Z1} />
                      </div>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                          Backward Pass
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          dW1 = X.T @ dZ1
                          <br />
                          db1 = sum(dZ1, axis=0)
                        </p>
                        <MatrixView title='dZ1 (Incoming Grad)' data={snap.dZ1} />
                        <MatrixView title='dW1 (Computed W1 Grad)' data={snap.dW1} />
                        <MatrixView title='db1 (Computed b1 Grad)' data={snap.db1} />
                      </div>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-emerald-700 mb-1 md:mb-2 border-b border-emerald-200 pb-1'>
                          Parameter Update
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          W1_new = W1 - lr * dW1
                          <br />
                          b1_new = b1 - lr * db1
                        </p>
                        <div className='bg-emerald-50 border border-emerald-200 rounded p-2 md:p-3 text-[10px] md:text-xs text-emerald-800 mb-3 md:mb-4 leading-relaxed'>
                          The learning rate ({learningRate}) scales the gradient. We
                          subtract this scaled gradient from the current weights to step
                          towards the minimum.
                        </div>
                        <MatrixView
                          title='W1 (Next Epoch Weights)'
                          data={
                            snap.dW1
                              ? updateParams(
                                  snap.W1,
                                  snap.dW1,
                                  snap.b1,
                                  snap.db1,
                                  learningRate,
                                ).newW
                              : null
                          }
                        />
                        <MatrixView
                          title='b1 (Next Epoch Biases)'
                          data={
                            snap.db1
                              ? updateParams(
                                  snap.W1,
                                  snap.dW1,
                                  snap.b1,
                                  snap.db1,
                                  learningRate,
                                ).newB
                              : null
                          }
                        />
                      </div>
                    </>
                  )}

                  {inspectorParty === 'relu' && (
                    <>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                          Forward Pass
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          A1 = max(0, Z1)
                        </p>
                        <MatrixView title='Z1 (Input from Layer 1)' data={snap.Z1} />
                        <MatrixView title='A1 (Output activated)' data={snap.A1} />
                      </div>
                      <div className='md:col-span-2'>
                        <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                          Backward Pass (Chain Rule)
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          Local = (Z1 &gt; 0)
                          <br />
                          Incoming = dA1
                          <br />
                          dZ1 = Incoming * Local
                        </p>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4'>
                          <MatrixView title='dA1 (Incoming Grad)' data={snap.dA1} />
                          <MatrixView title='dZ1 (Grad passed back)' data={snap.dZ1} />
                        </div>
                        <p className='text-[10px] md:text-xs text-slate-600 mt-2 bg-purple-50 p-2 md:p-3 rounded leading-relaxed'>
                          <strong>Note:</strong> ReLU simply acts as a gate. If the
                          original forward Z1 value was negative, the local gradient is 0.
                          If it was positive, the local gradient is 1, so the incoming dA1
                          gradient passes straight through untouched.
                        </p>
                      </div>
                    </>
                  )}

                  {inspectorParty === 'layer2' && (
                    <>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                          Forward Pass
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          Z2 = A1 @ W2 + b2
                        </p>
                        <MatrixView title='A1 (Input from ReLU)' data={snap.A1} />
                        <MatrixView title='W2 (Current Weights)' data={snap.W2} />
                        <MatrixView title='b2 (Current Biases)' data={snap.b2} />
                        <MatrixView title='Z2 (Output)' data={snap.Z2} />
                      </div>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                          Backward Pass
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          dW2 = A1.T @ dZ2
                          <br />
                          db2 = sum(dZ2, axis=0)
                        </p>
                        <MatrixView title='dZ2 (Incoming Grad)' data={snap.dZ2} />
                        <MatrixView title='dW2 (Computed W2 Grad)' data={snap.dW2} />
                        <MatrixView title='db2 (Computed b2 Grad)' data={snap.db2} />
                        <MatrixView title='dA1 (Grad passed back)' data={snap.dA1} />
                      </div>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-emerald-700 mb-1 md:mb-2 border-b border-emerald-200 pb-1'>
                          Parameter Update
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          W2_new = W2 - lr * dW2
                          <br />
                          b2_new = b2 - lr * db2
                        </p>
                        <MatrixView
                          title='W2 (Next Epoch Weights)'
                          data={
                            snap.dW2
                              ? updateParams(
                                  snap.W2,
                                  snap.dW2,
                                  snap.b2,
                                  snap.db2,
                                  learningRate,
                                ).newW
                              : null
                          }
                        />
                        <MatrixView
                          title='b2 (Next Epoch Biases)'
                          data={
                            snap.db2
                              ? updateParams(
                                  snap.W2,
                                  snap.dW2,
                                  snap.b2,
                                  snap.db2,
                                  learningRate,
                                ).newB
                              : null
                          }
                        />
                      </div>
                    </>
                  )}

                  {inspectorParty === 'sigmoid' && (
                    <>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                          Forward Pass
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          A2 = 1 / (1 + e^-Z2)
                        </p>
                        <MatrixView title='Z2 (Raw logic Layer 2)' data={snap.Z2} />
                        <MatrixView title='A2 (Final Probability)' data={snap.A2} />
                      </div>
                      <div className='md:col-span-2'>
                        <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                          Backward Pass (Chain Rule)
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          Local = A2 * (1 - A2)
                          <br />
                          Incoming = dA2
                          <br />
                          dZ2 = Incoming * Local
                        </p>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4'>
                          <MatrixView
                            title='dA2 (Incoming Grad from Loss)'
                            data={snap.dA2}
                          />
                          <MatrixView title='dZ2 (Grad passed back)' data={snap.dZ2} />
                        </div>
                        <p className='text-[10px] md:text-xs text-slate-600 mt-2 bg-purple-50 p-2 md:p-3 rounded leading-relaxed'>
                          <strong>Note:</strong> The local gradient of Sigmoid is maximum
                          at 0.5 and decays towards 0 at the extremes. It prevents drastic
                          updates if the network is already very confident.
                        </p>
                      </div>
                    </>
                  )}

                  {inspectorParty === 'loss' && (
                    <>
                      <div>
                        <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                          Forward (Evaluation)
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          Loss = BCE(A2, Y)
                        </p>
                        <MatrixView title='A2 (Predictions)' data={snap.A2} />
                        <MatrixView title='Y (True Labels)' data={Y_DATA.map(y => [y])} />
                        <div className='bg-red-50 text-red-700 p-2 md:p-3 rounded font-bold border border-red-200 flex justify-between items-center mt-2 md:mt-3'>
                          <span className='text-xs md:text-sm'>Mean BCE Loss:</span>
                          <span className='font-mono text-base md:text-xl'>
                            {snap.loss !== null ? snap.loss.toFixed(4) : '---'}
                          </span>
                        </div>
                      </div>
                      <div className='md:col-span-2'>
                        <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                          Backward (Starting Chain)
                        </h4>
                        <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                          dA2 = (-Y/A2 + (1-Y)/(1-A2)) / n
                        </p>
                        <div className='w-full sm:w-1/2 pr-0 sm:pr-2'>
                          <MatrixView
                            title='dA2 (Initial Grad sent back)'
                            data={snap.dA2}
                          />
                        </div>
                        <p className='text-[10px] md:text-xs text-slate-600 mt-2 bg-purple-50 p-2 md:p-3 rounded leading-relaxed'>
                          <strong>Note:</strong> This is the very beginning of
                          Backpropagation. The Loss function tells the final layer exactly
                          how "wrong" it is. A large positive value here means "decrease
                          this prediction", a negative value means "increase this
                          prediction".
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* 6. TEACHING SECTION (Order 6, Span 12)       */}
          {/* ========================================== */}
          <div className='order-6 lg:col-span-12 bg-indigo-900 text-indigo-50 p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border border-indigo-700'>
            <h2 className='text-lg md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3 border-b border-indigo-700 pb-2 md:pb-4'>
              <svg
                className='w-5 h-5 md:w-6 md:h-6'
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
              Understanding the Mathematics of the MLP
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-xs md:text-sm leading-relaxed text-indigo-100'>
              <div className='space-y-3 md:space-y-4'>
                <h3 className='font-bold text-base md:text-lg text-indigo-300'>
                  1. Forward Propagation (Predictions)
                </h3>
                <p>
                  We push the entire batch of 10 samples (matrix <strong>X</strong>)
                  through the network at once using matrix multiplication. This is
                  incredibly fast compared to looping through samples one by one.
                </p>
                <div className='bg-indigo-950 p-2 md:p-3 rounded-lg font-mono text-[10px] md:text-sm border border-indigo-800 leading-loose overflow-x-auto'>
                  Z1 = X @ W1 + b1
                  <br />
                  A1 = ReLU(Z1)
                  <br />
                  Z2 = A1 @ W2 + b2
                  <br />
                  A2 = Sigmoid(Z2){' '}
                  <span className='text-indigo-400'># Final Predictions</span>
                </div>
                <p>
                  The <strong>ReLU</strong> activation turns all negative values to 0,
                  introducing non-linearity. The <strong>Sigmoid</strong> squishes the
                  final output into a probability between 0 and 1.
                </p>
              </div>

              <div className='space-y-3 md:space-y-4'>
                <h3 className='font-bold text-base md:text-lg text-red-300'>
                  2. Loss (Evaluating Error)
                </h3>
                <p>
                  Because we are doing binary classification (Y is 0 or 1), we use{' '}
                  <strong>Binary Cross-Entropy (BCE)</strong>. It heavily penalizes the
                  network if it is confident but wrong.
                </p>
                <div className='bg-indigo-950 p-2 md:p-3 rounded-lg font-mono text-[10px] md:text-sm border border-indigo-800 overflow-x-auto'>
                  Loss = -mean(Y*log(A2) + (1-Y)*log(1-A2))
                </div>
                <p>
                  Our goal is to minimize this mean Loss value across all 10 samples. Use
                  the <strong>Inspector Panel</strong> above to see these exact matrix
                  values at any paused step!
                </p>
              </div>

              <div className='space-y-3 md:space-y-4'>
                <h3 className='font-bold text-base md:text-lg text-purple-300'>
                  3. Backpropagation (Chain Rule)
                </h3>
                <p>
                  We need to know how every single Weight and Bias contributed to the
                  Loss. We calculate derivatives backwards, layer by layer, multiplying
                  them together (The Chain Rule).
                </p>
                <div className='bg-indigo-950 p-2 md:p-3 rounded-lg font-mono text-[10px] md:text-[13px] border border-indigo-800 overflow-x-auto whitespace-pre leading-relaxed'>
                  <span className='text-purple-400'># Output Layer Gradients</span>
                  <br />
                  dA2 = BCE_Backward(A2, Y)
                  <br />
                  dZ2 = dA2 * Sigmoid_Backward(Z2)
                  <br />
                  dW2 = A1.T @ dZ2{' '}
                  <span className='text-indigo-400'># Gradients for W2</span>
                  <br />
                  db2 = sum(dZ2){' '}
                  <span className='text-indigo-400'># Gradients for b2</span>
                  <br />
                  <br />
                  <span className='text-purple-400'># Hidden Layer Gradients</span>
                  <br />
                  dA1 = dZ2 @ W2.T
                  <br />
                  dZ1 = dA1 * ReLU_Backward(Z1)
                  <br />
                  dW1 = X.T @ dZ1{' '}
                  <span className='text-indigo-400'># Gradients for W1</span>
                  <br />
                  db1 = sum(dZ1){' '}
                  <span className='text-indigo-400'># Gradients for b1</span>
                </div>
              </div>

              <div className='space-y-3 md:space-y-4'>
                <h3 className='font-bold text-base md:text-lg text-emerald-300'>
                  4. Parameter Update
                </h3>
                <p>
                  Now that we have the <strong>gradients</strong> (dW1, db1, dW2, db2),
                  which tell us the direction of "steepest ascent" in the loss landscape,
                  we step in the <em>opposite</em> direction.
                </p>
                <div className='bg-indigo-950 p-2 md:p-3 rounded-lg font-mono text-[10px] md:text-sm border border-indigo-800 leading-loose overflow-x-auto'>
                  W1 = W1 - (LearningRate * dW1)
                  <br />
                  b1 = b1 - (LearningRate * db1)
                  <br />
                  W2 = W2 - (LearningRate * dW2)
                  <br />
                  b2 = b2 - (LearningRate * db2)
                </div>
                <p>
                  As the epochs increase, watch the connection weights (the red and blue
                  lines) shift and stabilize, and the predictions in the table slowly
                  match the True Y values!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
