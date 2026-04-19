import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

export default function FunctionSelector({
  currentFunc,
  selectedFuncIdx,
  setSelectedFuncIdx,
  functions,
}) {
  return (
    <div className='order-3 lg:order-none bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-200'>
      {/* Formula Readout */}
      <div className='mb-2 md:mb-3 bg-slate-100 border border-slate-200 rounded-lg p-2 md:p-3 flex flex-col gap-1 md:gap-1.5 shadow-inner overflow-x-auto'>
        <div className='flex items-start gap-1.5 min-w-0'>
          <span className='font-bold text-violet-600 text-xs md:text-sm shrink-0'>
            <TeX math={currentFunc.fLatex} />
          </span>
        </div>
        <div className='flex items-start gap-1.5 min-w-0 border-t border-slate-200 pt-1'>
          <span className='font-bold text-violet-500 text-xs md:text-sm shrink-0'>
            <TeX math={currentFunc.dxLatex} />
          </span>
        </div>
        <div className='flex items-start gap-1.5 min-w-0 border-t border-slate-200 pt-1'>
          <span className='font-bold text-violet-400 text-xs md:text-sm shrink-0'>
            <TeX math={currentFunc.dyLatex} />
          </span>
        </div>
      </div>

      <label className='block text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1'>
        Select 3D Surface
      </label>
      <select
        className='w-full bg-white border border-slate-300 text-slate-900 text-xs md:text-sm rounded-lg p-1.5 md:p-2 shadow-sm focus:ring-violet-500 focus:border-violet-500 cursor-pointer'
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
  );
}
