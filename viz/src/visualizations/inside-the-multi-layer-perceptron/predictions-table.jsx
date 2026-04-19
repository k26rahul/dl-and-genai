import React from 'react';
import { clip } from './utils';
import { X_DATA, Y_DATA } from './constants';
import { TableIcon } from './assets/icons';

export default function PredictionsTable({ snap, isTableOpen, setIsTableOpen }) {
  return (
    <div className='bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-fit'>
      {/* Header - Clickable */}
      <div
        className='bg-slate-800 p-2.5 md:p-4 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors'
        onClick={() => setIsTableOpen(!isTableOpen)}
      >
        <h2 className='text-sm md:text-base font-bold text-white flex items-center gap-2'>
          <TableIcon className='w-4 h-4 md:w-5 md:h-5 text-blue-400' />
          Batch Predictions (10 Samples)
        </h2>
        <div className='text-slate-300 text-[10px] md:text-sm font-semibold'>
          {isTableOpen ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>

      {isTableOpen && (
        <div className='p-2 md:p-3 overflow-x-auto custom-scrollbar max-h-64 lg:max-h-96 overflow-y-auto'>
          <table className='w-full text-[10px] md:text-sm text-left min-w-[300px]'>
            <thead className='text-[9px] md:text-[10px] text-slate-500 bg-slate-50 uppercase border-b border-slate-200'>
              <tr>
                <th className='px-2 py-1.5 md:px-3 md:py-2'>ID</th>
                <th className='px-2 py-1.5 md:px-3 md:py-2'>Inputs (X)</th>
                <th className='px-2 py-1.5 md:px-3 md:py-2 text-center text-violet-700 font-bold'>
                  Pred (A2)
                </th>
                <th className='px-2 py-1.5 md:px-3 md:py-2 text-center'>True (Y)</th>
                <th className='px-2 py-1.5 md:px-3 md:py-2 text-right'>BCE Error</th>
              </tr>
            </thead>
            <tbody>
              {X_DATA.map((x, i) => {
                const pred = snap.A2 ? snap.A2[i][0] : null;
                const trueY = Y_DATA[i][0];
                let err = null;
                let isCorrect = false;

                if (pred !== null) {
                  const pClipped = clip(pred, 1e-9, 1 - 1e-9);
                  err = -(trueY * Math.log(pClipped) + (1 - trueY) * Math.log(1 - pClipped));
                  isCorrect = (pred >= 0.5 ? 1 : 0) === trueY;
                }

                const rowColor =
                  snap.epoch > 0 && pred !== null
                    ? isCorrect
                      ? 'bg-emerald-50/50'
                      : 'bg-red-50/50'
                    : '';

                return (
                  <tr
                    key={i}
                    className={`border-b border-slate-100 font-mono text-[10px] md:text-[13px] ${rowColor}`}
                  >
                    <td className='px-2 py-1.5 md:px-3 md:py-2 text-slate-400'>#{i}</td>
                    <td className='px-2 py-1.5 md:px-3 md:py-2 text-slate-600 truncate'>
                      [{x.map(v => v.toFixed(1)).join(', ')}]
                    </td>
                    <td className='px-2 py-1.5 md:px-3 md:py-2 text-center font-bold text-violet-600'>
                      {pred === null ? '---' : pred.toFixed(4)}
                    </td>
                    <td className='px-2 py-1.5 md:px-3 md:py-2 text-center font-bold text-slate-800'>
                      {trueY}
                    </td>
                    <td className='px-2 py-1.5 md:px-3 md:py-2 text-right text-red-500'>
                      {err === null ? '---' : err.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
