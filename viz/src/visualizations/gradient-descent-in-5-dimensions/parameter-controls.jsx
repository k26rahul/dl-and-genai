import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

export default function ParameterControls({ params, grads, currentFunc, handleManualChange, getDerivativeColor }) {
  return (
    <div className='order-2 lg:order-none bg-slate-800 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-700'>
      <div className='border-b border-slate-600 pb-1.5 mb-2'>
        <h2 className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1'>
          <span>Parameter Space</span>
          <span className='normal-case'>(<TeX math='x_1' /> – <TeX math='x_5' />)</span>
        </h2>
      </div>

      <div className='space-y-1.5 md:space-y-2'>
        {params.map((val, i) => {
          const m = grads[i];
          const color = getDerivativeColor(m);
          const arrowWidth = Math.min(60, 10 + Math.abs(m) * 5);

          return (
            <div
              key={i}
              className='flex flex-col gap-0.5 md:gap-1 bg-slate-700 p-1.5 md:p-2 rounded-lg border border-slate-600'
            >
              <div className='flex justify-between items-center'>
                <span className='font-bold text-slate-200 w-6 md:w-8 text-xs md:text-sm'>
                  <TeX math={`x_{${i + 1}}`} />
                </span>
                <input
                  type='range'
                  min={currentFunc.domain[0]}
                  max={currentFunc.domain[1]}
                  step='0.01'
                  value={val}
                  onChange={e => handleManualChange(i, parseFloat(e.target.value))}
                  className='flex-1 mx-2 md:mx-3 h-1 md:h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-violet-500'
                />
                <span className='font-mono text-[11px] md:text-sm font-semibold w-8 md:w-12 text-right text-violet-300'>
                  {val.toFixed(2)}
                </span>
              </div>

              <div className='flex justify-between items-center px-1 md:px-2 text-[9px] md:text-xs'>
                <span className='text-slate-400 font-semibold flex items-center gap-0.5'>
                  <TeX math={`\\partial Z / \\partial x_{${i + 1}}`} /> ={' '}
                  <span
                    style={{ color }}
                    className='font-mono text-[10px] md:text-sm ml-0.5'
                  >
                    {m > 0 ? '+' : ''}
                    {m.toFixed(2)}
                  </span>
                </span>

                <div className='h-3 md:h-4 flex items-center w-[60px] md:w-[80px] justify-end'>
                  {Math.abs(m) >= 0.01 ? (
                    <svg
                      width={arrowWidth}
                      height='12'
                      viewBox={`0 0 ${arrowWidth} 12`}
                      className='overflow-visible h-2.5 md:h-3'
                    >
                      {m > 0 ? (
                        <g>
                          <line
                            x1='0'
                            y1='6'
                            x2={arrowWidth - 6}
                            y2='6'
                            stroke={color}
                            strokeWidth='3'
                            strokeLinecap='round'
                          />
                          <polygon
                            points={`${arrowWidth},6 ${arrowWidth - 8},0 ${arrowWidth - 8},12`}
                            fill={color}
                          />
                        </g>
                      ) : (
                        <g>
                          <line
                            x1={arrowWidth}
                            y1='6'
                            x2='6'
                            y2='6'
                            stroke={color}
                            strokeWidth='3'
                            strokeLinecap='round'
                          />
                          <polygon points='0,6 8,0 8,12' fill={color} />
                        </g>
                      )}
                    </svg>
                  ) : (
                    <span className='text-slate-500 font-bold'>● Flat</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
