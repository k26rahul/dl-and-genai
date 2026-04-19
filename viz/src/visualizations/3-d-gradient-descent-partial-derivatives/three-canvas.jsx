import React from 'react';

export default function ThreeCanvas({ mountRef, threeLoaded, currentFunc, handleManualChange, x, y }) {
  return (
    <div className='order-1 lg:order-none bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-200'>
      <div
        ref={mountRef}
        className='w-full h-64 sm:h-80 md:h-[400px] bg-slate-100 rounded-lg overflow-hidden cursor-move relative'
      >
        {!threeLoaded && (
          <div className='absolute inset-0 flex items-center justify-center text-slate-400 text-xs md:text-sm'>
            Loading 3D Environment...
          </div>
        )}
      </div>
      <div className='text-center text-[10px] md:text-xs text-slate-400 mt-1.5'>
        Click and drag to rotate. Scroll to zoom.
      </div>

      {/* Sliders */}
      <div className='mt-2 md:mt-3 px-1 md:px-2 space-y-2 md:space-y-3'>
        <div>
          <label className='flex justify-between text-[11px] md:text-xs font-semibold text-slate-600 mb-1'>
            <span>Parameter X</span>
            <span className='text-rose-500 font-mono'>{x.toFixed(4)}</span>
          </label>
          <input
            type='range'
            min={currentFunc.domain[0]}
            max={currentFunc.domain[1]}
            step='0.001'
            value={x}
            onChange={e => handleManualChange('x', parseFloat(e.target.value))}
            className='w-full h-1.5 md:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500'
          />
        </div>
        <div>
          <label className='flex justify-between text-[11px] md:text-xs font-semibold text-slate-600 mb-1'>
            <span>Parameter Y</span>
            <span className='text-sky-600 font-mono'>{y.toFixed(4)}</span>
          </label>
          <input
            type='range'
            min={currentFunc.domain[0]}
            max={currentFunc.domain[1]}
            step='0.001'
            value={y}
            onChange={e => handleManualChange('y', parseFloat(e.target.value))}
            className='w-full h-1.5 md:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500'
          />
        </div>
      </div>
    </div>
  );
}
