import React from 'react';

export default function LossCurveChart({ lossHistory, snap, phase }) {
  return (
    <div className='bg-slate-800 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-700'>
      <h2 className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2 px-1'>
        Training Trajectory (Loss vs Epochs)
      </h2>
      <div className='w-full flex justify-center bg-slate-900 rounded-lg border border-slate-700 overflow-hidden relative h-28 md:h-48'>
        <div
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            phase === 'loss' ? 'bg-red-500/10' : 'opacity-0'
          }`}
        />
        <svg
          width='100%'
          height='100%'
          viewBox='0 0 800 200'
          preserveAspectRatio='none'
          className='bg-transparent'
        >
          {/* Axes */}
          <line x1='40' y1='160' x2='780' y2='160' stroke='#334155' strokeWidth='2' />
          <line x1='40' y1='20' x2='40' y2='160' stroke='#334155' strokeWidth='2' />

          {/* Labels */}
          <text x='400' y='190' fontSize='13' fill='#64748b' textAnchor='middle' fontWeight='bold'>
            Epochs
          </text>
          <text
            x='15'
            y='90'
            fontSize='13'
            fill='#64748b'
            textAnchor='middle'
            fontWeight='bold'
            transform='rotate(-90 15 90)'
          >
            BCE Loss
          </text>

          {lossHistory.length > 0 && (
            <>
              <text x='35' y='25' fontSize='11' fill='#64748b' textAnchor='end'>
                {Math.max(0.8, ...lossHistory.map(h => h.loss)).toFixed(1)}
              </text>
              <text x='780' y='175' fontSize='11' fill='#64748b' textAnchor='middle'>
                {Math.max(10, snap.epoch)}
              </text>
              <path
                d={lossHistory
                  .map((h, i) => {
                    const maxEp = Math.max(10, snap.epoch);
                    const maxL = Math.max(0.8, ...lossHistory.map(hl => hl.loss));
                    const px = 40 + (h.epoch / maxEp) * 740;
                    const py = 160 - (h.loss / maxL) * 140;
                    return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
                  })
                  .join(' ')}
                fill='none'
                stroke='#ef4444'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
