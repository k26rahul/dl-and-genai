import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

export default function StatusPanel({ x, y, m, derivativeColor, arrowWidth }) {
  const arrowDir = m < 0 ? '←' : m > 0 ? '→' : '•';
  const arrowLabel =
    Math.abs(m) < 0.01
      ? 'Flat (at minimum)'
      : m > 0
        ? 'Slope up → Step Left'
        : 'Slope down → Step Right';

  return (
    <div className='order-2 lg:order-none bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-200'>
      <h2 className='text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3'>
        Current Status
      </h2>

      {/* X / Y tiles */}
      <div className='grid grid-cols-2 gap-1.5 md:gap-2 mb-2 md:mb-3'>
        <div className='bg-violet-50 border border-violet-100 rounded-lg p-1.5 md:p-2 text-center'>
          <div className='text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5'>
            Current X
          </div>
          <div className='font-mono text-sm md:text-lg font-bold text-violet-900'>
            {x.toFixed(4)}
          </div>
        </div>
        <div className='bg-slate-100 border border-slate-200 rounded-lg p-1.5 md:p-2 text-center'>
          <div className='text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5'>
            Output Y
          </div>
          <div className='font-mono text-sm md:text-lg font-bold text-slate-700'>
            {y.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Derivative readout */}
      <div className='bg-slate-100 border border-slate-200 rounded-lg p-2 md:p-3 mb-2 md:mb-3'>
        <div className='text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1'>
          Derivative <TeX math="f'(x)" />
        </div>
        <div
          className='font-mono text-xl md:text-3xl font-bold text-center py-1'
          style={{ color: derivativeColor }}
        >
          {m.toFixed(4)}
        </div>
        <div className='text-[9px] md:text-xs text-center text-slate-500 mt-0.5'>
          {m > 0 ? '↑ Increasing' : m < 0 ? '↓ Decreasing' : '— Flat'}
        </div>
      </div>

      {/* Gradient arrow */}
      <div className='bg-slate-100 border border-slate-200 rounded-lg p-2 md:p-3'>
        <div className='text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 md:mb-2'>
          Steepest Ascent Direction
        </div>
        <div className='flex justify-center items-center'>
          <svg
            width={arrowWidth}
            height='28'
            style={{ maxWidth: '100%' }}
            viewBox={`0 0 ${arrowWidth} 28`}
          >
            <defs>
              <marker
                id='arrowhead-gd'
                markerWidth='8'
                markerHeight='6'
                refX='7'
                refY='3'
                orient='auto'
              >
                <polygon points='0 0, 8 3, 0 6' fill={derivativeColor} />
              </marker>
            </defs>
            <line
              x1={m > 0 ? 4 : arrowWidth - 4}
              y1='14'
              x2={m > 0 ? arrowWidth - 4 : 4}
              y2='14'
              stroke={derivativeColor}
              strokeWidth='5'
              markerEnd='url(#arrowhead-gd)'
            />
          </svg>
        </div>
        <div
          className='text-[10px] md:text-xs font-semibold text-center mt-1.5 md:mt-2'
          style={{ color: derivativeColor }}
        >
          {arrowLabel}
        </div>
      </div>
    </div>
  );
}
