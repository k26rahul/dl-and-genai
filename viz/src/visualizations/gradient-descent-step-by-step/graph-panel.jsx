import React, { useMemo } from 'react';

const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const MARGIN = 40;
const TANGENT_FRACTION = 0.15;

export default function GraphPanel({ currentFunc, x, setX, y, m, nextX, nextY }) {
  const [xMin, xMax] = currentFunc.domain;
  const [yMin, yMax] = currentFunc.range;

  const mapX = val => MARGIN + ((val - xMin) / (xMax - xMin)) * (SVG_WIDTH - 2 * MARGIN);
  const mapY = val =>
    SVG_HEIGHT - MARGIN - ((val - yMin) / (yMax - yMin)) * (SVG_HEIGHT - 2 * MARGIN);

  const pathData = useMemo(() => {
    const [dxMin, dxMax] = currentFunc.domain;
    const [dyMin, dyMax] = currentFunc.range;
    const steps = 200;
    const dx = (dxMax - dxMin) / steps;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const curX = dxMin + i * dx;
      const curY = currentFunc.f(curX);
      const px = MARGIN + ((curX - dxMin) / (dxMax - dxMin)) * (SVG_WIDTH - 2 * MARGIN);
      const py =
        SVG_HEIGHT - MARGIN - ((curY - dyMin) / (dyMax - dyMin)) * (SVG_HEIGHT - 2 * MARGIN);
      d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    }
    return d;
  }, [currentFunc]);

  const tangentLength = (xMax - xMin) * TANGENT_FRACTION;
  const tx1 = x - tangentLength;
  const ty1 = y - m * tangentLength;
  const tx2 = x + tangentLength;
  const ty2 = y + m * tangentLength;

  return (
    <div className='order-1 lg:order-none bg-slate-800 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-700'>
      <div className='w-full flex justify-center'>
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className='bg-slate-800 w-full h-auto'>
          {/* Axes */}
          <line
            x1={mapX(xMin)}
            y1={mapY(0)}
            x2={mapX(xMax)}
            y2={mapY(0)}
            stroke='#334155'
            strokeWidth='2'
          />
          <line
            x1={mapX(0)}
            y1={mapY(yMin)}
            x2={mapX(0)}
            y2={mapY(yMax)}
            stroke='#334155'
            strokeWidth='2'
          />
          <text
            x={SVG_WIDTH - MARGIN + 10}
            y={mapY(0) + 5}
            fontSize='13'
            fill='#64748b'
            fontWeight='bold'
          >
            X
          </text>
          <text
            x={mapX(0)}
            y={MARGIN - 15}
            fontSize='13'
            fill='#64748b'
            fontWeight='bold'
            textAnchor='middle'
          >
            Y
          </text>

          {/* Function Curve */}
          <path
            d={pathData}
            fill='none'
            stroke='#3b82f6'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
          />

          {/* Tangent Line */}
          <line
            x1={mapX(tx1)}
            y1={mapY(ty1)}
            x2={mapX(tx2)}
            y2={mapY(ty2)}
            stroke='#94a3b8'
            strokeWidth='2'
            strokeDasharray='5,5'
          />

          {/* Helper vertical line */}
          <line
            x1={mapX(x)}
            y1={mapY(y)}
            x2={mapX(x)}
            y2={mapY(0)}
            stroke='#ef4444'
            strokeWidth='1'
            strokeDasharray='3,3'
            opacity='0.4'
          />

          {/* Next point (ghost) */}
          <circle
            cx={mapX(nextX)}
            cy={mapY(nextY)}
            r='7'
            fill='none'
            stroke='#ef4444'
            strokeWidth='2.5'
            strokeDasharray='3,2'
          />

          {/* Current point */}
          <circle
            cx={mapX(x)}
            cy={mapY(y)}
            r='6'
            fill='#ef4444'
            stroke='#ffffff'
            strokeWidth='2'
          />
        </svg>
      </div>

      {/* X Slider */}
      <div className='mt-2 md:mt-3 px-1 md:px-2'>
        <label className='flex justify-between text-[11px] md:text-xs font-semibold text-slate-300 mb-1'>
          <span>Input Value (X) Slider</span>
          <span className='text-violet-400 font-mono'>{x.toFixed(4)}</span>
        </label>
        <input
          type='range'
          min={xMin}
          max={xMax}
          step='0.001'
          value={x}
          onChange={e => setX(parseFloat(e.target.value))}
          className='w-full h-1.5 md:h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-violet-500'
        />
      </div>
    </div>
  );
}
