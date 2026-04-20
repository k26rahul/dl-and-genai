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
    <div className='order-3 lg:order-none bg-slate-800 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-700'>
      {/* Formula Readout */}
      <div className='bg-slate-900 border border-slate-600 rounded-lg p-2 md:p-3 flex flex-col gap-1 md:gap-1.5 shadow-inner mb-2 md:mb-3 overflow-x-auto'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='font-bold text-violet-400 font-mono text-xs md:text-sm shrink-0'>
            <TeX math='f(x)' />
          </span>
          <span className='text-slate-500 shrink-0'>=</span>
          <span className='text-slate-300 font-mono text-xs md:text-sm'>
            <TeX math={currentFunc.formulaLatex} />
          </span>
        </div>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='font-bold text-violet-400 font-mono text-xs md:text-sm shrink-0'>
            <TeX math="f'(x)" />
          </span>
          <span className='text-slate-500 shrink-0'>=</span>
          <span className='text-slate-300 font-mono text-xs md:text-sm'>
            <TeX math={currentFunc.derivativeLatex} />
          </span>
        </div>
      </div>

      {/* Function Select */}
      <div>
        <label className='block text-[10px] md:text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1'>
          Select Function
        </label>
        <select
          value={selectedFuncIdx}
          onChange={e => setSelectedFuncIdx(Number(e.target.value))}
          className='w-full bg-slate-700 border border-slate-600 text-slate-200 text-xs md:text-sm rounded-lg p-1.5 md:p-2 shadow-sm focus:ring-violet-500 focus:border-violet-500'
        >
          {functions.map((fn, idx) => (
            <option key={fn.id} value={idx}>
              {fn.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
