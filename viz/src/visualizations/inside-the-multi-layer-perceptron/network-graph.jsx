import React from 'react';
import { SVG_W, SVG_H, IN_NODES, HID_NODES, OUT_NODES } from './constants';

const getWeightColor = w =>
  `rgba(${w < 0 ? '239, 68, 68' : '59, 130, 246'}, ${Math.min(0.2 + Math.abs(w) / 2, 1)})`;
const getWeightWidth = w => Math.max(1, Math.min(Math.abs(w) * 3, 6));

export default function NetworkGraph({ snap, phase }) {
  const isFast = phase === 'fast';
  const svgKey = isFast ? 'fast' : `${phase}-${snap.epoch}`;

  return (
    <div className='bg-slate-800 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-700 flex flex-col items-center relative overflow-hidden'>
      <div className='flex justify-between items-center w-full mb-1 border-b border-slate-600 pb-1.5'>
        <h2 className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest'>
          Architecture &amp; Flow
        </h2>

        {/* Phase badges */}
        <div className='flex gap-1 flex-wrap justify-end'>
          {[
            { id: 'forward', label: '1. Forward →', color: 'blue' },
            { id: 'loss', label: '2. Loss', color: 'red' },
            { id: 'backward', label: '3. Backward ←', color: 'purple' },
            { id: 'update', label: '4. Update', color: 'emerald' },
          ].map(p => (
            <span
              key={p.id}
              className={`text-[7px] md:text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                phase === p.id
                  ? `bg-${p.color}-100 text-${p.color}-700 ring-1 ring-${p.color}-400 scale-105`
                  : 'text-slate-600 bg-slate-700'
              }`}
            >
              {p.label}
            </span>
          ))}
          {isFast && (
            <span className='text-[7px] md:text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 ring-1 ring-amber-400 scale-105 animate-pulse'>
              Continuous
            </span>
          )}
        </div>
      </div>

      <svg key={svgKey} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className='w-full h-auto max-w-[380px]'>
        {/* W1 connections */}
        {IN_NODES.map((n1, i) =>
          HID_NODES.map((n2, j) => {
            const w = snap.W1[i][j];
            return (
              <g key={`w1-${i}-${j}`}>
                <line
                  x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                  stroke={getWeightColor(w)} strokeWidth={getWeightWidth(w)}
                  strokeLinecap='round' opacity='0.5'
                />
                {phase === 'forward' && (
                  <circle r='4' fill='#3b82f6' opacity='0'>
                    <set attributeName='opacity' to='1' begin='0s' />
                    <animateMotion path={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`} begin='0s' dur='0.4s' fill='freeze' />
                  </circle>
                )}
                {phase === 'backward' && (
                  <circle r='4' fill='#a855f7' opacity='0'>
                    <set attributeName='opacity' to='1' begin='0.4s' />
                    <animateMotion path={`M ${n2.x} ${n2.y} L ${n1.x} ${n1.y}`} begin='0.4s' dur='0.4s' fill='freeze' />
                  </circle>
                )}
                {isFast && (
                  <>
                    <circle r='4' fill='#3b82f6'>
                      <animateMotion path={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`} dur='0.3s' repeatCount='indefinite' />
                    </circle>
                    <circle r='4' fill='#a855f7'>
                      <animateMotion path={`M ${n2.x} ${n2.y} L ${n1.x} ${n1.y}`} dur='0.3s' repeatCount='indefinite' />
                    </circle>
                  </>
                )}
              </g>
            );
          })
        )}

        {/* W2 connections */}
        {HID_NODES.map((n1, i) => {
          const w = snap.W2[i][0];
          return (
            <g key={`w2-${i}-0`}>
              <line
                x1={n1.x} y1={n1.y} x2={OUT_NODES[0].x} y2={OUT_NODES[0].y}
                stroke={getWeightColor(w)} strokeWidth={getWeightWidth(w)}
                strokeLinecap='round' opacity='0.5'
              />
              {phase === 'forward' && (
                <circle r='4' fill='#3b82f6' opacity='0'>
                  <set attributeName='opacity' to='1' begin='0.4s' />
                  <animateMotion path={`M ${n1.x} ${n1.y} L ${OUT_NODES[0].x} ${OUT_NODES[0].y}`} begin='0.4s' dur='0.4s' fill='freeze' />
                </circle>
              )}
              {phase === 'backward' && (
                <circle r='4' fill='#a855f7' opacity='0'>
                  <set attributeName='opacity' to='1' begin='0s' />
                  <animateMotion path={`M ${OUT_NODES[0].x} ${OUT_NODES[0].y} L ${n1.x} ${n1.y}`} begin='0s' dur='0.4s' fill='freeze' />
                </circle>
              )}
              {isFast && (
                <>
                  <circle r='4' fill='#3b82f6'>
                    <animateMotion path={`M ${n1.x} ${n1.y} L ${OUT_NODES[0].x} ${OUT_NODES[0].y}`} dur='0.3s' repeatCount='indefinite' />
                  </circle>
                  <circle r='4' fill='#a855f7'>
                    <animateMotion path={`M ${OUT_NODES[0].x} ${OUT_NODES[0].y} L ${n1.x} ${n1.y}`} dur='0.3s' repeatCount='indefinite' />
                  </circle>
                </>
              )}
            </g>
          );
        })}

        {/* Input nodes */}
        {IN_NODES.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r='16' fill='#1e293b' stroke='#64748b' strokeWidth='2' />
            <text x={n.x} y={n.y + 4} fontSize='12' fill='#94a3b8' textAnchor='middle' fontWeight='bold'>{n.label}</text>
          </g>
        ))}

        {/* Hidden nodes */}
        {HID_NODES.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r='16' fill='#052e16' stroke='#22c55e' strokeWidth='2' />
            <text x={n.x} y={n.y + 4} fontSize='11' fill='#4ade80' textAnchor='middle' fontWeight='bold'>ReLU</text>
            <rect x={n.x - 6} y={n.y - 24} width='12' height='6' fill='#fbbf24' stroke='#d97706' strokeWidth='1' />
          </g>
        ))}

        {/* Output node */}
        {OUT_NODES.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r='18' fill='#0c1a3a' stroke='#3b82f6' strokeWidth='2' />
            <text x={n.x} y={n.y + 4} fontSize='10' fill='#93c5fd' textAnchor='middle' fontWeight='bold'>Sigmoid</text>
            <rect x={n.x - 6} y={n.y - 26} width='12' height='6' fill='#fbbf24' stroke='#d97706' strokeWidth='1' />
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className='mt-1.5 flex flex-wrap justify-center gap-2 md:gap-4 text-[9px] md:text-[11px] text-slate-400 border-t border-slate-600 pt-1.5 w-full'>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-1 md:w-4 md:h-1.5 bg-blue-500 rounded-full opacity-60' />
          <span className='font-medium'>Pos Weight</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-1 md:w-4 md:h-1.5 bg-red-500 rounded-full opacity-60' />
          <span className='font-medium'>Neg Weight</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-1.5 md:w-3 md:h-2 bg-amber-400 border border-amber-600' />
          <span className='font-medium'>Biases</span>
        </div>
      </div>
    </div>
  );
}
