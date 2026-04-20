import React, { useState, useEffect, useRef } from 'react';
import {
  randomMatrix,
  zeros,
  addBias,
  matMul,
  relu,
  sigmoid,
  reluBackward,
  sigmoidBackward,
  bceLoss,
  bceLossBackward,
  updateParams,
  sumAxis0,
  transpose,
} from './utils';
import { X_DATA, Y_DATA, LEARNING_RATES, NEXT_PHASE_MAP } from './constants';
import NetworkGraph from './network-graph';
import PredictionsTable from './predictions-table';
import LossCurveChart from './loss-curve-chart';
import InspectorPanel from './inspector-panel';

function makeInitialNet() {
  return {
    W1: randomMatrix(3, 4, 0.1),
    b1: zeros(1, 4),
    W2: randomMatrix(4, 1, 0.1),
    b2: zeros(1, 1),
    Z1: null, A1: null, Z2: null, A2: null,
    loss: null,
    dA2: null, dZ2: null, dW2: null, db2: null,
    dA1: null, dZ1: null, dW1: null, db1: null,
    epoch: 0,
  };
}

export default function Visualization() {
  const netRef = useRef(makeInitialNet());
  const [snap, setSnap] = useState({ ...netRef.current });
  const [lossHistory, setLossHistory] = useState([]);
  const [learningRate, setLearningRate] = useState(0.1);
  const [playMode, setPlayMode] = useState(0); // 0=Pause, 1=Normal, 2=Fast
  const [phase, setPhase] = useState('idle');

  // Collapsible panels
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [inspectorParty, setInspectorParty] = useState('layer1');

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
    netRef.current = makeInitialNet();
    setSnap({ ...netRef.current });
    setLossHistory([]);
    setPlayMode(0);
    setPhase('idle');
  };

  const handleStep = () => {
    const next = NEXT_PHASE_MAP[phase] || 'forward';
    runPhase(next);
    setPhase(next);
  };

  const togglePlay = () => {
    setPlayMode(prev => {
      if (prev === 0) return 1;
      if (prev === 1) return 2;
      return 1;
    });
  };

  // Animation engine
  useEffect(() => {
    if (playMode === 0) return;
    let timer;
    if (playMode === 1) {
      timer = setInterval(() => {
        setPhase(prevPhase => {
          const next = NEXT_PHASE_MAP[prevPhase] || 'forward';
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
  }, [playMode, learningRate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='flex flex-col gap-2 md:gap-3 lg:gap-4'>
      {/* TOP CONTROLS */}
      <div className='bg-slate-800 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-700 flex flex-wrap gap-2 items-center justify-between'>
        {/* Play / Reset */}
        <div className='flex gap-1.5 md:gap-2 items-center w-full sm:w-auto'>
          <button
            onClick={handleReset}
            className='flex-1 sm:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold bg-slate-600 text-slate-200 hover:bg-slate-500 transition-colors'
          >
            Reset
          </button>
          <button
            onClick={handleStep}
            disabled={playMode !== 0}
            className={`flex-1 sm:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-colors text-white shadow-sm ${
              playMode !== 0 ? 'bg-violet-800 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
            }`}
          >
            Step
          </button>
          <button
            onClick={togglePlay}
            className={`flex-1 sm:flex-none px-3 py-1.5 md:px-5 md:py-2 w-full sm:w-36 md:w-44 rounded-lg text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-1 md:gap-2 text-white shadow-sm ${
              playMode === 0
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : playMode === 1
                  ? 'bg-violet-600 hover:bg-violet-700'
                  : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {playMode === 0 ? '▶ Play' : playMode === 1 ? '⏭ Speed Up' : '⏮ Speed Down'}
          </button>
        </div>

        {/* LR */}
        <div className='flex gap-1.5 md:gap-2 items-center w-full sm:w-auto justify-between sm:justify-start'>
          <label className='text-xs md:text-sm font-semibold text-slate-300'>
            Learning Rate:
          </label>
          <select
            value={learningRate}
            onChange={e => setLearningRate(Number(e.target.value))}
            className='bg-slate-700 border border-slate-600 text-slate-200 rounded px-1.5 py-1 md:px-2 md:py-1.5 text-xs md:text-sm font-mono shadow-inner'
          >
            {LEARNING_RATES.map(lr => (
              <option key={lr} value={lr}>{lr.toFixed(2)}</option>
            ))}
          </select>
        </div>

        {/* Epoch + Loss readout */}
        <div className='flex items-center justify-center gap-3 md:gap-4 bg-slate-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-600 w-full lg:w-auto'>
          <div className='text-center'>
            <span className='text-slate-400 font-semibold uppercase tracking-wider text-[9px] md:text-[10px]'>
              Epoch
            </span>
            <div className='font-mono text-base md:text-lg font-bold text-slate-200 leading-none mt-0.5'>
              {snap.epoch}
            </div>
          </div>
          <div className='w-px h-6 md:h-8 bg-slate-500' />
          <div className='text-center w-16 md:w-20'>
            <span className='text-slate-400 font-semibold uppercase tracking-wider text-[9px] md:text-[10px]'>
              Mean Loss
            </span>
            <div className='font-mono text-base md:text-lg font-bold text-red-500 leading-none mt-0.5'>
              {snap.loss !== null ? snap.loss.toFixed(4) : '---'}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID */}
      <div className='flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-3 lg:gap-4'>
        {/* LEFT: Network Graph */}
        <div className='order-1 lg:col-span-5'>
          <NetworkGraph snap={snap} phase={phase} />
        </div>

        {/* RIGHT: Table + Loss Curve */}
        <div className='order-2 lg:col-span-7 flex flex-col gap-2 md:gap-3 lg:gap-4'>
          <PredictionsTable snap={snap} isTableOpen={isTableOpen} setIsTableOpen={setIsTableOpen} />
          <LossCurveChart lossHistory={lossHistory} snap={snap} phase={phase} />
        </div>
      </div>

      {/* FULL WIDTH: Inspector */}
      <InspectorPanel
        snap={snap}
        learningRate={learningRate}
        isOpen={isInspectorOpen}
        setIsOpen={setIsInspectorOpen}
        party={inspectorParty}
        setParty={setInspectorParty}
      />
    </div>
  );
}
