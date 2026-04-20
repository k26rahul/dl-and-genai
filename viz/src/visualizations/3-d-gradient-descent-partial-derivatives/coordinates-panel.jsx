import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

function PartialArrow({ slope, color, arrowWidth, labelFlat }) {
  return (
    <div className='h-4 md:h-6 flex items-center justify-center'>
      {Math.abs(slope) >= 0.01 ? (
        <svg
          width={arrowWidth}
          height='12'
          viewBox={`0 0 ${arrowWidth} 16`}
          className='overflow-visible transition-all duration-200 h-3 md:h-4'
        >
          {slope > 0 ? (
            <g>
              <line
                x1='0'
                y1='8'
                x2={arrowWidth - 8}
                y2='8'
                stroke={color}
                strokeWidth='4'
                strokeLinecap='round'
              />
              <polygon
                points={`${arrowWidth},8 ${arrowWidth - 10},2 ${arrowWidth - 10},14`}
                fill={color}
              />
            </g>
          ) : (
            <g>
              <line
                x1={arrowWidth}
                y1='8'
                x2='8'
                y2='8'
                stroke={color}
                strokeWidth='4'
                strokeLinecap='round'
              />
              <polygon points='0,8 10,2 10,14' fill={color} />
            </g>
          )}
        </svg>
      ) : (
        <span className='text-[10px] md:text-xs font-bold text-slate-500'>● {labelFlat}</span>
      )}
    </div>
  );
}

export default function CoordinatesPanel({ x, y, z, mX, mY, colorX, colorY, arrowWidthX, arrowWidthY }) {
  return (
    <div className='order-2 lg:order-none bg-slate-800 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-700 flex flex-col items-center'>
      <h2 className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest w-full border-b border-slate-600 pb-1.5 mb-2 md:mb-3'>
        Current Coordinates
      </h2>

      <div className='grid grid-cols-3 gap-1.5 md:gap-2 w-full mb-2 md:mb-3'>
        <div className='bg-rose-900/20 p-1.5 md:p-2 rounded-lg text-center border border-rose-800'>
          <div className='text-[9px] md:text-[10px] font-bold text-rose-500 uppercase tracking-wide'>
            X (Input)
          </div>
          <div className='text-sm md:text-lg font-mono font-semibold text-rose-300'>
            {x.toFixed(2)}
          </div>
        </div>
        <div className='bg-sky-900/20 p-1.5 md:p-2 rounded-lg text-center border border-sky-800'>
          <div className='text-[9px] md:text-[10px] font-bold text-sky-500 uppercase tracking-wide'>
            Y (Input)
          </div>
          <div className='text-sm md:text-lg font-mono font-semibold text-sky-300'>
            {y.toFixed(2)}
          </div>
        </div>
        <div className='bg-slate-700 p-1.5 md:p-2 rounded-lg text-center border border-slate-600'>
          <div className='text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wide'>
            Z (Output)
          </div>
          <div className='text-sm md:text-lg font-mono font-semibold text-slate-200'>
            {z.toFixed(2)}
          </div>
        </div>
      </div>

      <div className='w-full space-y-1.5 md:space-y-2'>
        {/* ∂Z/∂X */}
        <div className='flex flex-col items-center bg-slate-700 p-2 md:p-3 rounded-lg border border-slate-600'>
          <div className='flex justify-between w-full items-center mb-1'>
            <span className='text-[10px] md:text-xs font-bold text-slate-400'>
              Partial <TeX math='\partial Z / \partial X' />
            </span>
            <span className='font-mono font-bold text-sm md:text-lg' style={{ color: colorX }}>
              {mX > 0 ? '+' : ''}
              {mX.toFixed(2)}
            </span>
          </div>
          <PartialArrow slope={mX} color={colorX} arrowWidth={arrowWidthX} labelFlat='Flat in X' />
        </div>

        {/* ∂Z/∂Y */}
        <div className='flex flex-col items-center bg-slate-700 p-2 md:p-3 rounded-lg border border-slate-600'>
          <div className='flex justify-between w-full items-center mb-1'>
            <span className='text-[10px] md:text-xs font-bold text-slate-400'>
              Partial <TeX math='\partial Z / \partial Y' />
            </span>
            <span className='font-mono font-bold text-sm md:text-lg' style={{ color: colorY }}>
              {mY > 0 ? '+' : ''}
              {mY.toFixed(2)}
            </span>
          </div>
          <PartialArrow slope={mY} color={colorY} arrowWidth={arrowWidthY} labelFlat='Flat in Y' />
        </div>
      </div>
    </div>
  );
}
