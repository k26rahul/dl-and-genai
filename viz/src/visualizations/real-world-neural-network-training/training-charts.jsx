import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function TrainingChart({ history, maxEpochs, dsConfig, type }) {
  if (history.length === 0) return null;

  let key1, key2, color1, color2, domain, label1, label2;
  if (type === 'loss') {
    key1 = 'trainLoss'; key2 = 'testLoss';
    color1 = '#3b82f6'; color2 = '#f97316';
    domain = ['auto', 'auto'];
    label1 = 'Train Loss'; label2 = 'Test Loss';
  } else {
    key1 = 'trainMetric'; key2 = 'testMetric';
    color1 = '#22c55e'; color2 = '#ef4444';
    domain = dsConfig.type === 'classification' ? [0, 1] : ['auto', 'auto'];
    const metricName = dsConfig.type === 'classification' ? 'Accuracy' : 'MAE';
    label1 = `Train ${metricName}`; label2 = `Test ${metricName}`;
  }

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} />
        <XAxis
          dataKey='epoch'
          type='number'
          domain={[1, maxEpochs]}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          domain={domain}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
          tickFormatter={val => val.toFixed(2)}
        />
        <Tooltip
          contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
          formatter={(value, name) => [value.toFixed(4), name]}
          labelFormatter={label => `Epoch ${label}`}
          isAnimationActive={false}
        />
        <Line
          type='monotone'
          dataKey={key1}
          name={label1}
          stroke={color1}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type='monotone'
          dataKey={key2}
          name={label2}
          stroke={color2}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function LrChart({ lrCurve, epoch, currentLr, maxEpochs }) {
  const w = 150, h = 40;
  const maxLr = Math.max(...lrCurve);
  const mapX = e => (e / maxEpochs) * w;
  const mapY = v => h - (v / Math.max(0.001, maxLr)) * h;
  const path = lrCurve.map((v, i) => `${i === 0 ? 'M' : 'L'} ${mapX(i)} ${mapY(v)}`).join(' ');

  return (
    <div className='w-full h-12 bg-white rounded border border-violet-100 p-1 relative flex items-center'>
      <div className='absolute left-2 text-[8px] text-violet-400 font-mono'>
        LR: {currentLr.toFixed(4)}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className='w-full h-full overflow-visible'>
        <path
          d={path}
          fill='none'
          stroke='#7c3aed'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          opacity='0.5'
        />
        <circle cx={mapX(epoch)} cy={mapY(currentLr)} r='3' fill='#5b21b6' />
      </svg>
    </div>
  );
}
