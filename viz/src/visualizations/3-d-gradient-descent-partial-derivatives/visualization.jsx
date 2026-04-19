import React, { useState, useEffect, useRef } from 'react';
import { functions, learningRates } from './constants';
import { getDerivativeColor } from './utils';
import useThreeScene from './use-three-scene';
import ThreeCanvas from './three-canvas';
import FunctionSelector from './function-selector';
import CoordinatesPanel from './coordinates-panel';
import DescentControls from './descent-controls';

const MAX_ARROW_WIDTH = 150;
const getArrowWidth = slope => Math.min(MAX_ARROW_WIDTH, 20 + Math.abs(slope) * 15);

export default function Visualization() {
  const [threeLoaded, setThreeLoaded] = useState(false);
  const mountRef = useRef(null);
  const sceneElementsRef = useRef(null);

  const [selectedFuncIdx, setSelectedFuncIdx] = useState(0);
  const currentFunc = functions[selectedFuncIdx];

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [learningRate, setLearningRate] = useState(0.05);
  const [playMode, setPlayMode] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);

  // Reset position when function changes
  useEffect(() => {
    setX((currentFunc.domain[0] + currentFunc.domain[1]) / 2);
    setY((currentFunc.domain[0] + currentFunc.domain[1]) / 2);
  }, [selectedFuncIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load Three.js from CDN
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

  // Derived values
  const z = currentFunc.f(x, y);
  const mX = currentFunc.dx(x, y);
  const mY = currentFunc.dy(x, y);
  const [minBound, maxBound] = currentFunc.domain;

  const nextX = Math.max(minBound, Math.min(maxBound, x - learningRate * mX));
  const nextY = Math.max(minBound, Math.min(maxBound, y - learningRate * mY));
  const nextZ = currentFunc.f(nextX, nextY);

  const handleStep = () => {
    setX(nextX);
    setY(nextY);
  };

  const handleManualChange = (axis, value) => {
    if (axis === 'x') setX(value);
    if (axis === 'y') setY(value);
    setIsInteracting(true);
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 500);
  };

  // Auto-play loop
  useEffect(() => {
    if (playMode === 0 || isInteracting) return;
    const delay = playMode === 1 ? 500 : 250;
    const timer = setTimeout(() => handleStep(), delay);
    return () => clearTimeout(timer);
  }, [playMode, isInteracting, nextX, nextY]); // eslint-disable-line react-hooks/exhaustive-deps

  // Three.js scene (init + update)
  useThreeScene(mountRef, sceneElementsRef, threeLoaded, currentFunc, x, y, nextX, nextY, z, nextZ);

  const colorX = getDerivativeColor(mX);
  const colorY = getDerivativeColor(mY);
  const arrowWidthX = getArrowWidth(mX);
  const arrowWidthY = getArrowWidth(mY);

  return (
    <div className='flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-3 lg:gap-4'>
      {/* LEFT COLUMN: 3D Canvas + Function Selector */}
      <div className='contents lg:flex lg:flex-col lg:col-span-7 lg:gap-4'>
        <ThreeCanvas
          mountRef={mountRef}
          threeLoaded={threeLoaded}
          currentFunc={currentFunc}
          handleManualChange={handleManualChange}
          x={x}
          y={y}
        />
        <FunctionSelector
          currentFunc={currentFunc}
          selectedFuncIdx={selectedFuncIdx}
          setSelectedFuncIdx={setSelectedFuncIdx}
          functions={functions}
        />
      </div>

      {/* RIGHT COLUMN: Coordinates + Controls */}
      <div className='contents lg:flex lg:flex-col lg:col-span-5 lg:gap-4'>
        <CoordinatesPanel
          x={x}
          y={y}
          z={z}
          mX={mX}
          mY={mY}
          colorX={colorX}
          colorY={colorY}
          arrowWidthX={arrowWidthX}
          arrowWidthY={arrowWidthY}
        />
        <DescentControls
          learningRate={learningRate}
          setLearningRate={setLearningRate}
          learningRates={learningRates}
          playMode={playMode}
          setPlayMode={setPlayMode}
          handleStep={handleStep}
          x={x}
          y={y}
          nextX={nextX}
          nextY={nextY}
          mX={mX}
          mY={mY}
          colorX={colorX}
          colorY={colorY}
        />
      </div>
    </div>
  );
}
