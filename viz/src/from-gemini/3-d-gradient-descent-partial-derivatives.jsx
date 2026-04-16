import React, { useState, useEffect, useRef } from 'react';

// Mathematical Functions for 3D Surfaces
// zScale is used purely for visual rendering to prevent the 3D plot from becoming too tall,
// the mathematical steps (X, Y, derivatives) use the true unscaled values.
const functions = [
  {
    id: 'bowl',
    name: 'Convex Bowl (Simple Minimum)',
    f: (x, y) => x * x + y * y,
    dx: (x, y) => 2 * x,
    dy: (x, y) => 2 * y,
    domain: [-3, 3],
    zScale: 0.3,
  },
  {
    id: 'saddle',
    name: 'Saddle Point (Min in X, Max in Y)',
    f: (x, y) => x * x - y * y,
    dx: (x, y) => 2 * x,
    dy: (x, y) => -2 * y,
    domain: [-3, 3],
    zScale: 0.3,
  },
  {
    id: 'himmelblau',
    name: 'Himmelblau (4 Local Minima)',
    // A famous test function for optimization with 4 identical local minima
    f: (x, y) => Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2),
    dx: (x, y) => 4 * x * (x * x + y - 11) + 2 * (x + y * y - 7),
    dy: (x, y) => 2 * (x * x + y - 11) + 4 * y * (x + y * y - 7),
    domain: [-5, 5],
    zScale: 0.015,
  },
  {
    id: 'wave',
    name: 'Sinusoidal Valley',
    f: (x, y) => 3 * Math.sin(x) + 3 * Math.cos(y) + 0.2 * (x * x + y * y),
    dx: (x, y) => 3 * Math.cos(x) + 0.4 * x,
    dy: (x, y) => -3 * Math.sin(y) + 0.4 * y,
    domain: [-5, 5],
    zScale: 0.5,
  },
];

const learningRates = [0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

export default function App() {
  const [threeLoaded, setThreeLoaded] = useState(false);
  const mountRef = useRef(null);
  const sceneElementsRef = useRef(null); // Stores references to Three.js objects to update them

  const [selectedFuncIdx, setSelectedFuncIdx] = useState(0);
  const currentFunc = functions[selectedFuncIdx];

  // State for the sliders (Input X and Y)
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const [learningRate, setLearningRate] = useState(0.05);

  const [playMode, setPlayMode] = useState(0); // 0: paused, 1: 2 steps/s, 2: 4 steps/s
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);

  // Reset positions when the function changes
  useEffect(() => {
    setX((currentFunc.domain[0] + currentFunc.domain[1]) / 2);
    setY((currentFunc.domain[0] + currentFunc.domain[1]) / 2);
  }, [selectedFuncIdx, currentFunc.domain]);

  // Load Three.js dynamically and safely load OrbitControls
  useEffect(() => {
    const loadOrbitControls = () => {
      if (window.THREE && window.THREE.OrbitControls) {
        setThreeLoaded(true);
        return;
      }
      const script2 = document.createElement('script');
      script2.src =
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
      script2.onload = () => setThreeLoaded(true);
      document.head.appendChild(script2);
    };

    if (window.THREE) {
      loadOrbitControls();
    } else {
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script1.onload = loadOrbitControls;
      document.head.appendChild(script1);
    }
  }, []);

  // Current mathematical values
  const z = currentFunc.f(x, y);
  const mX = currentFunc.dx(x, y); // ∂Z/∂X
  const mY = currentFunc.dy(x, y); // ∂Z/∂Y

  // Calculate NEXT positions
  const [minBound, maxBound] = currentFunc.domain;

  const rawNextX = x - learningRate * mX;
  const nextX = Math.max(minBound, Math.min(maxBound, rawNextX));

  const rawNextY = y - learningRate * mY;
  const nextY = Math.max(minBound, Math.min(maxBound, rawNextY));

  const nextZ = currentFunc.f(nextX, nextY);

  const handleStep = () => {
    setX(nextX);
    setY(nextY);
  };

  const handleManualChange = (axis, value) => {
    if (axis === 'x') setX(value);
    if (axis === 'y') setY(value);

    // Pause auto-play while the user is actively sliding
    setIsInteracting(true);
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);

    // Resume auto-play half a second after they let go
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
  }, [playMode, isInteracting, nextX, nextY]);

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

  const colorX = getDerivativeColor(mX);
  const colorY = getDerivativeColor(mY);

  // Arrow size logic
  const maxArrowWidth = 150;
  const getArrowWidth = slope => Math.min(maxArrowWidth, 20 + Math.abs(slope) * 15);
  const arrowWidthX = getArrowWidth(mX);
  const arrowWidthY = getArrowWidth(mY);

  // Three.js Initialization (Runs once when loaded)
  useEffect(() => {
    if (!threeLoaded || !mountRef.current) return;
    const THREE = window.THREE;
    if (!THREE || !THREE.OrbitControls) return;

    const container = mountRef.current;
    container.innerHTML = ''; // Clear prior canvas if unmounted poorly

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // slate-50 background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Axes Helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Surface Mesh
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });
    const surfaceMesh = new THREE.Mesh(geometry, material);

    // Wireframe overlay for better visibility of the surface structure
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    surfaceMesh.add(wireframeMesh);
    scene.add(surfaceMesh);

    // Solid Red Dot (Current)
    const currentDotGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const currentDotMat = new THREE.MeshPhongMaterial({ color: 0xef4444 });
    const currentDot = new THREE.Mesh(currentDotGeo, currentDotMat);
    scene.add(currentDot);

    // Solid Gray Dot (Next Step)
    const nextDotGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const nextDotMat = new THREE.MeshPhongMaterial({ color: 0x9ca3af });
    const nextDot = new THREE.Mesh(nextDotGeo, nextDotMat);
    scene.add(nextDot);

    let reqId;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    sceneElementsRef.current = {
      scene,
      camera,
      renderer,
      controls,
      surfaceMesh,
      currentDot,
      nextDot,
    };

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sceneElementsRef.current = null;
    };
  }, [threeLoaded]);

  // Update Geometry & Positions (Runs when dependencies change)
  useEffect(() => {
    const elements = sceneElementsRef.current;
    if (!elements || !window.THREE) return;

    const { surfaceMesh, currentDot, nextDot } = elements;
    const THREE = window.THREE;

    // Update Surface Geometry based on current function
    const size = 60;
    const [min, max] = currentFunc.domain;
    const vertices = [];
    const indices = [];

    // Generate Vertices
    for (let i = 0; i <= size; i++) {
      const mathY = min + (i / size) * (max - min);
      for (let j = 0; j <= size; j++) {
        const mathX = min + (j / size) * (max - min);
        const mathZ = currentFunc.f(mathX, mathY);
        // Map to Three.js coordinates (Math Z becomes Three Y, Math Y becomes Three Z)
        vertices.push(mathX, mathZ * currentFunc.zScale, mathY);
      }
    }

    // Generate Indices for triangles
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const a = i * (size + 1) + j;
        const b = a + 1;
        const c = a + (size + 1);
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    surfaceMesh.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    surfaceMesh.geometry.setIndex(indices);
    surfaceMesh.geometry.computeVertexNormals();

    // Update Dot Positions
    currentDot.position.set(x, z * currentFunc.zScale, y);
    nextDot.position.set(nextX, nextZ * currentFunc.zScale, nextY);
  }, [x, y, nextX, nextY, currentFunc, z, nextZ, threeLoaded]);

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans'>
      <div className='max-w-7xl mx-auto'>
        <header className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            3D Gradient Descent: Partial Derivatives
          </h1>
          <p className='text-slate-600'>
            Explore how optimizing two parameters creates a trajectory over a 3D surface.
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* LEFT COLUMN: GRAPH & CONTROLS */}
          <div className='lg:col-span-7 flex flex-col gap-6'>
            {/* 3D Canvas Container */}
            <div className='bg-white p-4 rounded-2xl shadow-sm border border-slate-200'>
              <div
                ref={mountRef}
                className='w-full h-[400px] bg-slate-100 rounded-xl overflow-hidden cursor-move relative'
              >
                {!threeLoaded && (
                  <div className='absolute inset-0 flex items-center justify-center text-slate-400'>
                    Loading 3D Environment...
                  </div>
                )}
                {/* 3D Canvas injects here */}
              </div>
              <div className='text-center text-xs text-slate-400 mt-2'>
                Click and drag to rotate the 3D view. Scroll to zoom.
              </div>

              {/* Interaction Sliders */}
              <div className='mt-6 px-4 space-y-4'>
                <div>
                  <label className='flex justify-between text-sm font-semibold text-slate-700 mb-2'>
                    <span>Parameter X</span>
                    <span className='text-blue-600 font-mono'>{x.toFixed(4)}</span>
                  </label>
                  <input
                    type='range'
                    min={currentFunc.domain[0]}
                    max={currentFunc.domain[1]}
                    step='0.001'
                    value={x}
                    onChange={e => handleManualChange('x', parseFloat(e.target.value))}
                    className='w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600'
                  />
                </div>
                <div>
                  <label className='flex justify-between text-sm font-semibold text-slate-700 mb-2'>
                    <span>Parameter Y</span>
                    <span className='text-emerald-600 font-mono'>{y.toFixed(4)}</span>
                  </label>
                  <input
                    type='range'
                    min={currentFunc.domain[0]}
                    max={currentFunc.domain[1]}
                    step='0.001'
                    value={y}
                    onChange={e => handleManualChange('y', parseFloat(e.target.value))}
                    className='w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600'
                  />
                </div>
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
                          {lr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex gap-2 w-full sm:w-auto'>
                    <button
                      onClick={handleStep}
                      disabled={playMode !== 0}
                      className={`flex-1 sm:flex-none text-white font-bold py-2.5 px-6 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center gap-2 ${
                        playMode !== 0
                          ? 'bg-indigo-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                      }`}
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

                    <button
                      onClick={() => setPlayMode(p => (p + 1) % 3)}
                      className={`flex-1 sm:flex-none font-bold py-2.5 px-6 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center gap-2 text-white ${
                        playMode === 0
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : playMode === 1
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {playMode === 0 && (
                        <>
                          <svg
                            className='w-5 h-5'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                              clipRule='evenodd'
                            ></path>
                          </svg>
                          Auto-Play
                        </>
                      )}
                      {playMode === 1 && (
                        <>
                          <svg
                            className='w-5 h-5'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M10 18a8 8 0 100-16 8 8 0 000 16zM7.555 7.168A1 1 0 006 8v4a1 1 0 001.555.832l2-1.333v1.333a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2A1 1 0 009.555 8v1.333L7.555 7.168z'></path>
                          </svg>
                          Fast (2x)
                        </>
                      )}
                      {playMode === 2 && (
                        <>
                          <svg
                            className='w-5 h-5'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z'
                              clipRule='evenodd'
                            ></path>
                          </svg>
                          Stop
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dynamic Computation Display */}
                <div className='mt-2 bg-white p-4 rounded-lg border border-indigo-200 shadow-inner'>
                  <div className='text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>
                    Partial Step Computations
                  </div>

                  {/* X Computation */}
                  <div className='font-mono text-[14px] text-slate-700 flex flex-col gap-1 mb-4'>
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
                      <span className='font-semibold' style={{ color: colorX }}>
                        {mX < 0 ? `(${mX.toFixed(4)})` : mX.toFixed(4)}
                      </span>
                      <span>)</span>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-2'>
                      <span>
                        X<sub>new</sub> =
                      </span>
                      <span className='font-bold text-red-500'>{nextX.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className='w-full h-px bg-slate-100 mb-4'></div>

                  {/* Y Computation */}
                  <div className='font-mono text-[14px] text-slate-700 flex flex-col gap-1'>
                    <div className='flex flex-wrap items-center gap-x-2'>
                      <span>
                        Y<sub>new</sub> =
                      </span>
                      <span className='font-semibold text-emerald-700'>
                        {y.toFixed(4)}
                      </span>
                      <span>- (</span>
                      <span className='font-semibold text-purple-600'>
                        {learningRate}
                      </span>
                      <span>×</span>
                      <span className='font-semibold' style={{ color: colorY }}>
                        {mY < 0 ? `(${mY.toFixed(4)})` : mY.toFixed(4)}
                      </span>
                      <span>)</span>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-2'>
                      <span>
                        Y<sub>new</sub> =
                      </span>
                      <span className='font-bold text-red-500'>{nextY.toFixed(4)}</span>
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
                Select 3D Surface
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
                Current Coordinates
              </h2>

              <div className='grid grid-cols-3 gap-3 w-full mb-6'>
                <div className='bg-blue-50 p-2 rounded-lg text-center border border-blue-100'>
                  <div className='text-[10px] font-bold text-blue-600 uppercase tracking-wide'>
                    X (Input)
                  </div>
                  <div className='text-lg font-mono font-semibold text-blue-900'>
                    {x.toFixed(2)}
                  </div>
                </div>
                <div className='bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100'>
                  <div className='text-[10px] font-bold text-emerald-600 uppercase tracking-wide'>
                    Y (Input)
                  </div>
                  <div className='text-lg font-mono font-semibold text-emerald-900'>
                    {y.toFixed(2)}
                  </div>
                </div>
                <div className='bg-slate-50 p-2 rounded-lg text-center border border-slate-200'>
                  <div className='text-[10px] font-bold text-slate-500 uppercase tracking-wide'>
                    Z (Output)
                  </div>
                  <div className='text-lg font-mono font-semibold text-slate-800'>
                    {z.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Partial Derivatives Display */}
              <div className='w-full space-y-4'>
                {/* X Derivative Arrow Row */}
                <div className='flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-100'>
                  <div className='flex justify-between w-full items-center mb-2'>
                    <span className='text-xs font-bold text-slate-500 uppercase'>
                      Partial ∂Z/∂X
                    </span>
                    <span
                      className='font-mono font-bold text-lg'
                      style={{ color: colorX }}
                    >
                      {mX > 0 ? '+' : ''}
                      {mX.toFixed(2)}
                    </span>
                  </div>
                  {Math.abs(mX) >= 0.01 ? (
                    <svg
                      width={arrowWidthX}
                      height='16'
                      viewBox={`0 0 ${arrowWidthX} 16`}
                      className='overflow-visible transition-all duration-200'
                    >
                      {mX > 0 ? (
                        <g>
                          <line
                            x1='0'
                            y1='8'
                            x2={arrowWidthX - 8}
                            y2='8'
                            stroke={colorX}
                            strokeWidth='4'
                            strokeLinecap='round'
                          />
                          <polygon
                            points={`${arrowWidthX},8 ${arrowWidthX - 10},2 ${arrowWidthX - 10},14`}
                            fill={colorX}
                          />
                        </g>
                      ) : (
                        <g>
                          <line
                            x1={arrowWidthX}
                            y1='8'
                            x2='8'
                            y2='8'
                            stroke={colorX}
                            strokeWidth='4'
                            strokeLinecap='round'
                          />
                          <polygon points={`0,8 10,2 10,14`} fill={colorX} />
                        </g>
                      )}
                    </svg>
                  ) : (
                    <span className='text-xs font-bold text-slate-400 py-1'>
                      ● Flat in X
                    </span>
                  )}
                </div>

                {/* Y Derivative Arrow Row */}
                <div className='flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-100'>
                  <div className='flex justify-between w-full items-center mb-2'>
                    <span className='text-xs font-bold text-slate-500 uppercase'>
                      Partial ∂Z/∂Y
                    </span>
                    <span
                      className='font-mono font-bold text-lg'
                      style={{ color: colorY }}
                    >
                      {mY > 0 ? '+' : ''}
                      {mY.toFixed(2)}
                    </span>
                  </div>
                  {Math.abs(mY) >= 0.01 ? (
                    <svg
                      width={arrowWidthY}
                      height='16'
                      viewBox={`0 0 ${arrowWidthY} 16`}
                      className='overflow-visible transition-all duration-200'
                    >
                      {mY > 0 ? (
                        <g>
                          <line
                            x1='0'
                            y1='8'
                            x2={arrowWidthY - 8}
                            y2='8'
                            stroke={colorY}
                            strokeWidth='4'
                            strokeLinecap='round'
                          />
                          <polygon
                            points={`${arrowWidthY},8 ${arrowWidthY - 10},2 ${arrowWidthY - 10},14`}
                            fill={colorY}
                          />
                        </g>
                      ) : (
                        <g>
                          <line
                            x1={arrowWidthY}
                            y1='8'
                            x2='8'
                            y2='8'
                            stroke={colorY}
                            strokeWidth='4'
                            strokeLinecap='round'
                          />
                          <polygon points={`0,8 10,2 10,14`} fill={colorY} />
                        </g>
                      )}
                    </svg>
                  ) : (
                    <span className='text-xs font-bold text-slate-400 py-1'>
                      ● Flat in Y
                    </span>
                  )}
                </div>
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
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  ></path>
                </svg>
                Partial Derivatives
              </h3>

              <div className='text-sm text-blue-900 space-y-4'>
                <p>
                  <strong>1. What is a Partial Derivative?</strong> Because our surface
                  has two inputs (X and Y), we must look at them one at a time. The
                  partial derivative <strong>∂Z/∂X</strong> is the change in Z with
                  respect to X, <em>assuming Y is strictly constant</em>. Similarly, the
                  partial derivative <strong>∂Z/∂Y</strong> is the change in Z with
                  respect to Y, <em>assuming X is strictly constant</em>.
                </p>

                <div className='bg-white p-3 rounded-lg border border-blue-100 shadow-sm space-y-2'>
                  <p>
                    <strong>2. Two Directions to Minimize:</strong> The rules for finding
                    the minimum apply independently to both axes (X and Y):
                  </p>
                  <ul className='list-disc pl-5 space-y-2 text-slate-700'>
                    <li>
                      <strong>
                        If a partial derivative is{' '}
                        <span className='font-semibold text-green-600'>Positive</span>:
                      </strong>{' '}
                      Moving forward along that axis makes Z increase (&#8593;). To go
                      down toward the minimum, we must move{' '}
                      <strong>backward (&#8592;)</strong> on that axis.
                    </li>
                    <li>
                      <strong>
                        If a partial derivative is{' '}
                        <span className='font-semibold text-red-600'>Negative</span>:
                      </strong>{' '}
                      Moving forward along that axis makes Z decrease (&#8595;). To go
                      down toward the minimum, we must keep moving{' '}
                      <strong>forward (&#8594;)</strong> on that axis.
                    </li>
                  </ul>
                </div>

                <p>
                  <strong>3. The Combined Step:</strong> Gradient descent combines both of
                  these corrections simultaneously. We multiply each partial derivative by
                  the Learning Rate and subtract them from our current coordinates.
                </p>

                <div className='bg-white p-3 rounded-lg border border-blue-100 shadow-sm'>
                  <p className='font-semibold mb-2'>4. Navigating the 3D Terrain:</p>
                  <p className='text-slate-700'>
                    By following the <strong>solid gray dot</strong>, we walk down the
                    steepest path of the surface. Try selecting the{' '}
                    <strong>Saddle Point</strong> or <strong>Himmelblau</strong> to see
                    how the dot navigates complex ridges and valleys!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
