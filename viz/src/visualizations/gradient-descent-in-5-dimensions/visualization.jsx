import React, { useState, useEffect, useRef } from 'react';
import { functions, learningRates } from './constants';
import { getDerivativeColor } from './utils';
import LossCurveChart from './loss-curve-chart';
import FunctionSelector from './function-selector';
import ParameterControls from './parameter-controls';
import DescentControls from './descent-controls';

const INITIAL_PARAMS = [3, 4, -3, 2, -4];

export default function Visualization() {
  const [selectedFuncIdx, setSelectedFuncIdx] = useState(0);
  const currentFunc = functions[selectedFuncIdx];

  const [params, setParams] = useState(INITIAL_PARAMS);
  const [learningRate, setLearningRate] = useState(0.1);
  const [epoch, setEpoch] = useState(0);
  const [history, setHistory] = useState([{ epoch: 0, z: currentFunc.f(INITIAL_PARAMS) }]);
  const [playMode, setPlayMode] = useState(0); // 0: paused, 1: auto (2/s), 2: fast (4/s)
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);

  const z = currentFunc.f(params);
  const grads = currentFunc.grad(params);

  // Reset when function changes
  useEffect(() => {
    setParams(INITIAL_PARAMS);
    setEpoch(0);
    setHistory([{ epoch: 0, z: currentFunc.f(INITIAL_PARAMS) }]);
    setPlayMode(0);
  }, [selectedFuncIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStep = () => {
    const nextParams = params.map((p, i) => {
      const nextP = p - learningRate * grads[i];
      return Math.max(currentFunc.domain[0], Math.min(currentFunc.domain[1], nextP));
    });
    const nextZ = currentFunc.f(nextParams);
    const nextEpoch = epoch + 1;
    setParams(nextParams);
    setEpoch(nextEpoch);
    setHistory(prev => [...prev, { epoch: nextEpoch, z: nextZ }]);
  };

  const handleManualChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    const newZ = currentFunc.f(newParams);
    setParams(newParams);
    setEpoch(0);
    setHistory([{ epoch: 0, z: newZ }]);
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
  }, [playMode, isInteracting, params, epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-3 lg:gap-4'>
      {/* LEFT COLUMN: Loss Curve + Function Selector */}
      <div className='contents lg:flex lg:flex-col lg:col-span-6 lg:gap-4'>
        <LossCurveChart history={history} epoch={epoch} z={z} />
        <FunctionSelector
          currentFunc={currentFunc}
          selectedFuncIdx={selectedFuncIdx}
          setSelectedFuncIdx={setSelectedFuncIdx}
          functions={functions}
        />
      </div>

      {/* RIGHT COLUMN: Parameters + Controls */}
      <div className='contents lg:flex lg:flex-col lg:col-span-6 lg:gap-4'>
        <ParameterControls
          params={params}
          grads={grads}
          currentFunc={currentFunc}
          handleManualChange={handleManualChange}
          getDerivativeColor={getDerivativeColor}
        />
        <DescentControls
          learningRate={learningRate}
          setLearningRate={setLearningRate}
          learningRates={learningRates}
          playMode={playMode}
          setPlayMode={setPlayMode}
          handleStep={handleStep}
        />
      </div>
    </div>
  );
}
