import React, { useState } from 'react';

function LayerRow({ layerKey, label, inSize, outSize, bgClass, borderClass, textClass, badgeClass, parsedBatch }) {
  const [isOpen, setIsOpen] = useState(false);
  const weights = inSize * outSize;
  const biases = outSize;
  const params = weights + biases;
  return (
    <div className={`rounded border ${borderClass} overflow-hidden`}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`w-full flex justify-between items-center text-[10px] md:text-xs ${bgClass} ${textClass} p-1.5 hover:opacity-80 transition-opacity`}
      >
        <span className='font-bold flex items-center gap-1'>
          <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} inline-block`}>▶</span>
          {label}
        </span>
        <span className='font-mono flex items-center gap-2'>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeClass}`}>
            {params.toLocaleString()} params
          </span>
          <span>{outSize} neuron{outSize > 1 ? 's' : ''}</span>
        </span>
      </button>
      {isOpen && (
        <div className={`${bgClass} border-t ${borderClass} px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] md:text-[10px] font-mono ${textClass} opacity-90`}>
          <div><span className='opacity-60'>Weights:</span> <strong>{inSize} × {outSize} = {weights.toLocaleString()}</strong></div>
          <div><span className='opacity-60'>Biases:</span> <strong>{biases}</strong></div>
          <div><span className='opacity-60'>Input shape:</span> <strong>({parsedBatch}, {inSize})</strong></div>
          <div><span className='opacity-60'>Output shape:</span> <strong>({parsedBatch}, {outSize})</strong></div>
        </div>
      )}
    </div>
  );
}

export default function ArchitecturePanel({ rawData, dataLoaded, depth, neurons, dsConfig, batchSize, totalRows }) {
  if (!dataLoaded || !rawData) {
    return (
      <div className='bg-slate-800 p-3 md:p-4 rounded-lg md:rounded-xl shadow-sm border border-slate-700'>
        <div className='text-xs text-slate-400 italic py-2'>Loading configuration...</div>
      </div>
    );
  }

  const numFeatures = rawData.features.length;
  const parsedBatch =
    batchSize === 'Full'
      ? (totalRows ? Math.floor(totalRows * 0.8) : 'N')
      : parseInt(batchSize, 10);

  const layerSizes = [...neurons.slice(0, depth), dsConfig.outNeurons];
  const inputSizes = [numFeatures, ...layerSizes.slice(0, -1)];
  let totalParams = 0;
  layerSizes.forEach((outSize, i) => {
    totalParams += inputSizes[i] * outSize + outSize;
  });

  return (
    <div className='bg-slate-800 p-3 md:p-4 rounded-lg md:rounded-xl shadow-sm border border-slate-700'>
      <div className='flex justify-between items-center border-b border-slate-600 pb-2 mb-2'>
        <h2 className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest'>
          Network Architecture
        </h2>
        <span className='text-[10px] font-bold bg-slate-700 text-white px-2 py-0.5 rounded-full font-mono border border-slate-600'>
          {totalParams.toLocaleString()} params
        </span>
      </div>

      <div className='flex flex-col gap-1.5'>
        <div className='flex justify-between text-[10px] md:text-xs bg-slate-700 p-1.5 rounded border border-slate-600'>
          <span className='font-bold text-slate-400'>Features (Input):</span>
          <span className='font-mono text-slate-200'>{numFeatures} — shape ({parsedBatch}, {numFeatures})</span>
        </div>

        {[...Array(depth)].map((_, i) => (
          <LayerRow
            key={i}
            layerKey={`hidden_${i}`}
            label={`Hidden L${i + 1} (ReLU)`}
            inSize={inputSizes[i]}
            outSize={layerSizes[i]}
            parsedBatch={parsedBatch}
            bgClass='bg-violet-900/20'
            borderClass='border-violet-700'
            textClass='text-violet-200'
            badgeClass='bg-violet-800 text-violet-100'
          />
        ))}

        <LayerRow
          layerKey='output'
          label={`Output (${dsConfig.activation})`}
          inSize={inputSizes[depth]}
          outSize={dsConfig.outNeurons}
          parsedBatch={parsedBatch}
          bgClass='bg-purple-900/20'
          borderClass='border-purple-700'
          textClass='text-purple-200'
          badgeClass='bg-purple-800 text-purple-100'
        />
      </div>
    </div>
  );
}
