import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import { LightningIcon } from './assets/icons';

export default function ControlsPanel({
  learningRate,
  setLearningRate,
  learningRates,
  handleStep,
  x,
  m,
  nextX,
  rawNextX,
  derivativeColor,
}) {
  return (
    <div className='order-4 lg:order-none bg-violet-50 border border-violet-100 rounded-lg md:rounded-xl p-2 md:p-3 shadow-sm'>
      <h2 className='text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3'>
        Gradient Descent Controls
      </h2>

      {/* LR + Step button row */}
      <div className='flex items-center gap-2 md:gap-3 mb-2 md:mb-3'>
        <div className='flex-1'>
          <label className='block text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1'>
            Learning Rate <TeX math='\eta' />
          </label>
          <select
            value={learningRate}
            onChange={e => setLearningRate(parseFloat(e.target.value))}
            className='w-full bg-white border border-violet-200 text-violet-900 text-xs md:text-sm rounded-lg p-1.5 md:p-2 font-mono shadow-sm focus:ring-violet-500 focus:border-violet-500'
          >
            {learningRates.map(lr => (
              <option key={lr} value={lr}>
                {lr}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleStep}
          className='flex items-center justify-center gap-1 md:gap-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold py-1.5 md:py-2 px-3 md:px-4 rounded-lg shadow-sm transition-colors text-xs md:text-sm mt-4 md:mt-5 shrink-0'
        >
          <LightningIcon className='w-3.5 h-3.5 md:w-4 md:h-4' />
          Take a Step
        </button>
      </div>

      {/* Step Computation Display */}
      <div className='bg-white border border-violet-200 shadow-inner rounded-lg p-2 md:p-3'>
        <div className='text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 md:mb-2'>
          Step Computation
        </div>

        <div className='font-mono text-[11px] md:text-[14px] text-slate-700 flex flex-col gap-1 md:gap-1.5'>
          {/* Symbolic formula row using KaTeX */}
          <div className='flex items-center gap-1'>
            <TeX math="x_{new} = x_{curr} - (\eta \cdot f'(x))" />
          </div>

          <div className='w-full h-px bg-slate-200 my-0.5' />

          {/* Value row */}
          <div className='flex flex-wrap items-center gap-x-1 md:gap-x-1.5'>
            <span>
              x<sub>new</sub> =
            </span>
            <span className='font-semibold text-violet-700'>{x.toFixed(4)}</span>
            <span>- (</span>
            <span className='font-semibold text-violet-500'>{learningRate}</span>
            <span>×</span>
            <span className='font-semibold' style={{ color: derivativeColor }}>
              {m < 0 ? `(${m.toFixed(4)})` : m.toFixed(4)}
            </span>
            <span>)</span>
          </div>

          {/* Result row */}
          <div className='flex flex-wrap items-center gap-x-1 md:gap-x-1.5 text-sm md:text-base mt-0.5 md:mt-1'>
            <span>
              x<sub>new</sub> =
            </span>
            <span className='font-bold text-rose-500'>{nextX.toFixed(4)}</span>
            {Math.abs(nextX - rawNextX) > 0.0001 && (
              <span className='text-[9px] md:text-[10px] text-slate-400 font-sans ml-1'>
                (Clamped)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
