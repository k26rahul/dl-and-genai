import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import { LightningIcon, PlayIcon, FastIcon, StopIcon } from './assets/icons';

export default function DescentControls({
  learningRate,
  setLearningRate,
  learningRates,
  playMode,
  setPlayMode,
  handleStep,
  x,
  y,
  nextX,
  nextY,
  mX,
  mY,
  colorX,
  colorY,
}) {
  return (
    <div className='order-4 lg:order-none p-2 md:p-3 bg-violet-50 border border-violet-100 rounded-lg md:rounded-xl shadow-sm flex flex-col gap-2'>
      {/* LR Select + Buttons */}
      <div className='flex flex-col sm:flex-row gap-2 items-end'>
        <div className='flex-1 w-full'>
          <label className='block text-[10px] md:text-xs font-semibold text-slate-600 tracking-wide mb-1'>
            <span className='uppercase'>Learning Rate</span> <span className='normal-case inline-block'><TeX math='\eta' /></span>
          </label>
          <select
            className='w-full bg-white border border-violet-200 text-violet-900 text-xs md:text-sm rounded-lg p-1.5 md:p-2 shadow-sm font-mono focus:ring-violet-500 focus:border-violet-500'
            value={learningRate}
            onChange={e => setLearningRate(Number(e.target.value))}
          >
            {learningRates.map((lr, idx) => (
              <option key={lr} value={lr}>
                {lr}
                {idx === 0
                  ? ' (Very Small)'
                  : idx === learningRates.length - 1
                    ? ' (Very Large)'
                    : ''}
              </option>
            ))}
          </select>
        </div>

        <div className='flex gap-1.5 w-full sm:w-auto mt-1 sm:mt-0'>
          <button
            onClick={handleStep}
            disabled={playMode !== 0}
            className={`flex-1 sm:flex-none text-white font-bold py-1.5 px-3 md:py-2 md:px-4 text-xs md:text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1 ${
              playMode !== 0
                ? 'bg-violet-300 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800'
            }`}
          >
            <LightningIcon className='w-3 h-3 md:w-4 md:h-4' />
            Step
          </button>

          <button
            onClick={() => setPlayMode(p => (p + 1) % 3)}
            className={`flex-1 sm:flex-none font-bold py-1.5 px-3 md:py-2 md:px-4 text-xs md:text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1 text-white ${
              playMode === 0
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : playMode === 1
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {playMode === 0 ? (
              <><PlayIcon className='w-3 h-3 md:w-4 md:h-4' /> Auto</>
            ) : playMode === 1 ? (
              <><FastIcon className='w-3 h-3 md:w-4 md:h-4' /> Fast</>
            ) : (
              <><StopIcon className='w-3 h-3 md:w-4 md:h-4' /> Stop</>
            )}
          </button>
        </div>
      </div>

      {/* Computation Display */}
      <div className='bg-white p-2 md:p-3 rounded-lg border border-violet-200 shadow-inner'>
        <div className='text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 md:mb-2'>
          Partial Computations
        </div>

        <div className='font-mono text-[10px] md:text-[13px] text-slate-700 flex flex-col gap-0.5 md:gap-1'>
          {/* X row */}
          <div className='flex flex-wrap items-center gap-x-1'>
            <span className='flex items-center text-slate-600'><TeX math='x_{new} =' /></span>
            <span className='font-semibold text-rose-600'>{x.toFixed(4)}</span>
            <span>- (</span>
            <span className='font-semibold text-violet-500'>{learningRate}</span>
            <span>×</span>
            <span className='font-semibold' style={{ color: colorX }}>
              {mX < 0 ? `(${mX.toFixed(4)})` : mX.toFixed(4)}
            </span>
            <span>)</span>
            <span className='mx-1'>→</span>
            <span className='font-bold text-rose-500'>{nextX.toFixed(4)}</span>
          </div>

          <div className='w-full h-px bg-slate-100 my-0.5' />

          {/* Y row */}
          <div className='flex flex-wrap items-center gap-x-1'>
            <span className='flex items-center text-slate-600'><TeX math='y_{new} =' /></span>
            <span className='font-semibold text-sky-600'>{y.toFixed(4)}</span>
            <span>- (</span>
            <span className='font-semibold text-violet-500'>{learningRate}</span>
            <span>×</span>
            <span className='font-semibold' style={{ color: colorY }}>
              {mY < 0 ? `(${mY.toFixed(4)})` : mY.toFixed(4)}
            </span>
            <span>)</span>
            <span className='mx-1'>→</span>
            <span className='font-bold text-sky-500'>{nextY.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
