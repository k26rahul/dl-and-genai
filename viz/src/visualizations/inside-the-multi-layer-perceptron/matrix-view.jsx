import React from 'react';

export default function MatrixView({ title, data }) {
  if (!data)
    return (
      <div className='text-[10px] md:text-xs text-slate-400 italic p-1.5 md:p-2 border rounded border-slate-600 bg-slate-800 flex items-center flex-wrap gap-1'>
        <span>Waiting for</span>
        <span className='inline-flex items-center'>{title}</span>
        <span>...</span>
      </div>
    );
  return (
    <div className='mb-2 md:mb-3 bg-slate-800 rounded-lg border border-slate-700 shadow-sm overflow-hidden flex flex-col w-full'>
      <div className='bg-slate-700 px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[11px] font-bold text-slate-200 border-b border-slate-600 flex justify-between'>
        <span className='truncate mr-2'>{title}</span>
        <span className='font-normal text-slate-400 shrink-0'>
          ({data.length}x{data[0].length})
        </span>
      </div>
      <div className='overflow-x-auto max-h-32 md:max-h-40 p-1 custom-scrollbar'>
        <table className='text-[9px] md:text-[10px] font-mono w-full text-right border-collapse'>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className='border-b border-slate-700 hover:bg-slate-700'>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className={`px-1.5 py-0.5 md:px-2 md:py-1 ${
                      Math.abs(val) < 1e-4
                        ? 'text-slate-600'
                        : val > 0
                          ? 'text-blue-400'
                          : 'text-red-400'
                    }`}
                  >
                    {typeof val === 'number' ? val.toFixed(4) : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
