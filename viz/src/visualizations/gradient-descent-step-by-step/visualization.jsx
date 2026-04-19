import React, { useState, useEffect } from 'react';
import { functions, learningRates } from './constants';
import { getDerivativeColor } from './utils';
import GraphPanel from './graph-panel';
import FunctionSelector from './function-selector';
import StatusPanel from './status-panel';
import ControlsPanel from './controls-panel';

const MAX_ARROW_WIDTH = 200;
const BASE_ARROW_WIDTH = 20;

export default function Visualization() {
  const [selectedFuncIdx, setSelectedFuncIdx] = useState(0);
  const currentFunc = functions[selectedFuncIdx];

  const [x, setX] = useState(
    (currentFunc.domain[0] + currentFunc.domain[1]) / 2,
  );
  const [learningRate, setLearningRate] = useState(0.1);

  // Reset x to domain midpoint when function changes
  useEffect(() => {
    setX((currentFunc.domain[0] + currentFunc.domain[1]) / 2);
  }, [selectedFuncIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const y = currentFunc.f(x);
  const m = currentFunc.df(x);
  const [xMin, xMax] = currentFunc.domain;
  const rawNextX = x - learningRate * m;
  const nextX = Math.max(xMin, Math.min(xMax, rawNextX));
  const nextY = currentFunc.f(nextX);

  const handleStep = () => setX(nextX);

  const derivativeColor = getDerivativeColor(m);
  const arrowWidth = Math.min(MAX_ARROW_WIDTH, BASE_ARROW_WIDTH + Math.abs(m) * 20);

  return (
    <div className='flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-3 lg:gap-4'>
      {/* LEFT COLUMN: Graph + Function Selector */}
      <div className='contents lg:flex lg:flex-col lg:col-span-7 lg:gap-4'>
        <GraphPanel
          currentFunc={currentFunc}
          x={x}
          setX={setX}
          y={y}
          m={m}
          nextX={nextX}
          nextY={nextY}
        />
        <FunctionSelector
          currentFunc={currentFunc}
          selectedFuncIdx={selectedFuncIdx}
          setSelectedFuncIdx={setSelectedFuncIdx}
          functions={functions}
        />
      </div>

      {/* RIGHT COLUMN: Status + Controls */}
      <div className='contents lg:flex lg:flex-col lg:col-span-5 lg:gap-4'>
        <StatusPanel
          x={x}
          y={y}
          m={m}
          derivativeColor={derivativeColor}
          arrowWidth={arrowWidth}
        />
        <ControlsPanel
          learningRate={learningRate}
          setLearningRate={setLearningRate}
          learningRates={learningRates}
          handleStep={handleStep}
          x={x}
          m={m}
          nextX={nextX}
          rawNextX={rawNextX}
          derivativeColor={derivativeColor}
        />
      </div>
    </div>
  );
}
