import React from 'react';

const SVG_WIDTH = 600;
const SVG_HEIGHT = 250;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

export default function LossCurveChart({ history, epoch, z }) {
  const maxEpoch = Math.max(10, ...history.map(h => h.epoch));
  const maxZ = Math.max(10, ...history.map(h => h.z));
  const minZ = Math.min(0, ...history.map(h => h.z));

  const mapEpochToX = e =>
    MARGIN.left + (e / maxEpoch) * (SVG_WIDTH - MARGIN.left - MARGIN.right);
  const mapZToY = val =>
    SVG_HEIGHT -
    MARGIN.bottom -
    ((val - minZ) / (maxZ - minZ)) * (SVG_HEIGHT - MARGIN.top - MARGIN.bottom);

  const pathData =
    history.length > 0
      ? history
          .map((h, i) => `${i === 0 ? 'M' : 'L'} ${mapEpochToX(h.epoch)} ${mapZToY(h.z)}`)
          .join(' ')
      : '';

  return (
    <div className='order-1 lg:order-none bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-200'>
      <h2 className='text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1'>
        Training Progress (Loss Curve)
      </h2>
      <div className='w-full flex justify-center bg-slate-50 rounded-lg border border-slate-100 overflow-hidden'>
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className='bg-transparent w-full h-auto'>
          {/* Axes */}
          <line
            x1={MARGIN.left}
            y1={mapZToY(0)}
            x2={SVG_WIDTH - MARGIN.right}
            y2={mapZToY(0)}
            stroke='#e2e8f0'
            strokeWidth='2'
          />
          <line
            x1={MARGIN.left}
            y1={MARGIN.top}
            x2={MARGIN.left}
            y2={SVG_HEIGHT - MARGIN.bottom}
            stroke='#e2e8f0'
            strokeWidth='2'
          />

          {/* Axis Labels */}
          <text
            x={SVG_WIDTH / 2}
            y={SVG_HEIGHT - 5}
            fontSize='13'
            fill='#94a3b8'
            fontWeight='bold'
            textAnchor='middle'
          >
            Epoch (Time)
          </text>
          <text
            x={MARGIN.left - 35}
            y={SVG_HEIGHT / 2}
            fontSize='13'
            fill='#94a3b8'
            fontWeight='bold'
            transform={`rotate(-90, ${MARGIN.left - 35}, ${SVG_HEIGHT / 2})`}
            textAnchor='middle'
          >
            Output (Z)
          </text>

          {/* Axis Ticks */}
          <text
            x={MARGIN.left}
            y={SVG_HEIGHT - MARGIN.bottom + 15}
            fontSize='11'
            fill='#94a3b8'
            textAnchor='middle'
          >
            0
          </text>
          <text
            x={SVG_WIDTH - MARGIN.right}
            y={SVG_HEIGHT - MARGIN.bottom + 15}
            fontSize='11'
            fill='#94a3b8'
            textAnchor='middle'
          >
            {maxEpoch}
          </text>
          <text
            x={MARGIN.left - 5}
            y={MARGIN.top + 5}
            fontSize='11'
            fill='#94a3b8'
            textAnchor='end'
          >
            {maxZ.toFixed(0)}
          </text>

          {/* Curve */}
          <path
            d={pathData}
            fill='none'
            stroke='#3b82f6'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
          />

          {/* Current dot */}
          <circle
            cx={mapEpochToX(epoch)}
            cy={mapZToY(z)}
            r='5'
            fill='#ef4444'
            stroke='#ffffff'
            strokeWidth='2'
          />
        </svg>
      </div>

      <div className='mt-2 flex justify-between px-1'>
        <div className='text-[11px] md:text-xs'>
          <span className='text-slate-500 font-semibold'>Epoch: </span>
          <span className='font-mono font-bold text-violet-600'>{epoch}</span>
        </div>
        <div className='text-[11px] md:text-xs'>
          <span className='text-slate-500 font-semibold'>Output Z: </span>
          <span className='font-mono font-bold text-rose-500'>{z.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
