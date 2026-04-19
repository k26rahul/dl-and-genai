import React from 'react';
import { idbClear, EPOCH_OPTIONS } from './constants';

export default function ControlsBar({
  isTraining,
  dataLoaded,
  downloadProgress,
  startTraining,
  stopTraining,
  resetTraining,
  selectedDataset,
  setSelectedDataset,
  allDatasets,
  cacheHit,
  setCacheHit,
  depth,
  setDepth,
  neurons,
  setNeurons,
  maxEpochs,
  setMaxEpochs,
  epoch,
  history,
}) {
  return (
    <div className='bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-200'>
      <div className='flex flex-wrap gap-3 md:gap-4 items-end'>
        {/* Train / Stop / Reset */}
        <div className='flex-shrink-0 w-full sm:w-auto flex gap-2'>
          <button
            onClick={resetTraining}
            disabled={isTraining}
            className='flex-1 sm:flex-none sm:w-20 bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 font-bold py-2 px-3 rounded-lg shadow-sm transition-colors text-xs md:text-sm'
          >
            Reset
          </button>
          {isTraining ? (
            <button
              onClick={stopTraining}
              className='flex-1 sm:flex-none sm:w-24 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-xs md:text-sm flex justify-center items-center gap-2'
            >
              ⏹ Stop
            </button>
          ) : (
            <button
              onClick={startTraining}
              disabled={!dataLoaded || downloadProgress !== null}
              className={`flex-1 sm:flex-none sm:w-24 font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-xs md:text-sm flex justify-center items-center gap-2 ${
                !dataLoaded || downloadProgress !== null
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              {downloadProgress !== null
                ? 'Downloading…'
                : !dataLoaded
                  ? 'Loading…'
                  : '▶ Train'}
            </button>
          )}
        </div>

        {/* Dataset */}
        <div className='flex flex-col w-full sm:w-auto'>
          <div className='flex items-center justify-between mb-1 gap-3'>
            <label className='text-[10px] font-bold text-slate-500 uppercase'>Target Dataset</label>
            <div className='flex items-center gap-2'>
              {cacheHit && (
                <span className='text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded'>
                  ⚡ cached
                </span>
              )}
              <button
                onClick={async () => { await idbClear(); setCacheHit(false); }}
                className='text-[9px] text-slate-400 hover:text-red-500 transition-colors'
                title='Clear all cached datasets'
              >
                clear cache
              </button>
            </div>
          </div>
          <select
            value={selectedDataset ?? ''}
            onChange={e => setSelectedDataset(e.target.value)}
            disabled={isTraining || downloadProgress !== null}
            className='bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-xs md:text-sm font-semibold'
          >
            {['Binary Classification', 'Multiclass Classification', 'Regression'].map(groupName => {
              const groupDatasets = Object.values(allDatasets).filter(ds => {
                if (groupName === 'Binary Classification') return ds.type === 'classification' && ds.classes === 2;
                if (groupName === 'Multiclass Classification') return ds.type === 'classification' && ds.classes > 2;
                return ds.type === 'regression';
              });
              if (groupDatasets.length === 0) return null;
              return (
                <optgroup key={groupName} label={groupName}>
                  {groupDatasets.map(ds => (
                    <option key={ds.id} value={ds.id}>{ds.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* Hidden Layers */}
        <div className='flex flex-col w-full sm:w-auto'>
          <label className='text-[10px] font-bold text-slate-500 uppercase mb-1'>Hidden Layers</label>
          <select
            value={depth}
            onChange={e => setDepth(Number(e.target.value))}
            disabled={isTraining}
            className='bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-xs md:text-sm font-semibold'
          >
            <option value={1}>1 Layer</option>
            <option value={2}>2 Layers</option>
            <option value={3}>3 Layers</option>
          </select>
        </div>

        {/* Neurons per layer */}
        <div className='flex gap-2 w-full sm:w-auto'>
          {[...Array(depth)].map((_, i) => (
            <div key={i} className='flex flex-col'>
              <label className='text-[10px] font-bold text-violet-500 uppercase mb-1'>L{i + 1} Neurons</label>
              <select
                value={neurons[i]}
                onChange={e => {
                  const n = [...neurons];
                  n[i] = Number(e.target.value);
                  setNeurons(n);
                }}
                disabled={isTraining}
                className='bg-violet-50 border border-violet-200 text-violet-900 rounded-md px-2 py-1.5 text-xs font-mono shadow-inner'
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
                <option value={64}>64</option>
              </select>
            </div>
          ))}
        </div>

        {/* Max Epochs */}
        <div className='flex flex-col w-full sm:w-auto'>
          <label className='text-[10px] font-bold text-slate-500 uppercase mb-1'>Max Epochs</label>
          <select
            value={maxEpochs}
            onChange={e => { setMaxEpochs(Number(e.target.value)); resetTraining(); }}
            disabled={isTraining}
            className='bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-xs md:text-sm font-semibold'
          >
            {EPOCH_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Epoch + Loss Readout */}
        <div className='flex items-center justify-center gap-3 bg-slate-100 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-200 w-full lg:w-auto ml-auto'>
          <div className='text-center'>
            <span className='text-slate-500 font-semibold uppercase tracking-wider text-[9px] md:text-[10px]'>Epoch</span>
            <div className='font-mono text-base md:text-lg font-bold text-slate-800 leading-none mt-0.5'>{epoch}</div>
          </div>
          <div className='w-px h-6 md:h-8 bg-slate-300' />
          <div className='text-center w-16 md:w-20'>
            <span className='text-slate-500 font-semibold uppercase tracking-wider text-[9px] md:text-[10px]'>Mean Loss</span>
            <div className='font-mono text-base md:text-lg font-bold text-red-500 leading-none mt-0.5'>
              {history.length > 0 ? history[history.length - 1].trainLoss.toFixed(4) : '---'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
