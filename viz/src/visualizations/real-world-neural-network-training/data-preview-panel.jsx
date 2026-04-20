import React from 'react';
import { clip } from './constants';

export default function DataPreviewPanel({
  dsConfig,
  rawData,
  isTableOpen,
  setIsTableOpen,
  dataSplit,
  trainIndices,
  testIndices,
  predictions,
  isTrainTableOpen,
  setIsTrainTableOpen,
  isTestTableOpen,
  setIsTestTableOpen,
  rollTrainDice,
  rollTestDice,
  totalRows,
  trainRows,
  testRows,
  trainBatches,
  testBatches,
  dataLoaded,
}) {
  const renderPreviewTable = (
    type,
    indices,
    dataX,
    dataY,
    predArrayGroup,
    isOpen,
    toggleOpen,
    diceRoll,
  ) => {
    if (!dataX || !dataY || indices.length === 0) return null;
    return (
      <div className='bg-slate-800 rounded-lg shadow-sm border border-slate-700 flex flex-col overflow-hidden mb-2'>
        <div
          className='bg-slate-800 p-2 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors border-b border-slate-700'
          onClick={toggleOpen}
        >
          <h2 className='text-xs font-bold text-white flex items-center gap-2'>
            {type === 'Train' ? '🚂' : '🧪'} {type} Samples (10 random)
          </h2>
          <div className='flex items-center gap-3'>
            <button
              onClick={diceRoll}
              className='text-lg hover:scale-110 transition-transform'
              title='Randomize'
            >
              🎲
            </button>
            <span className='text-slate-400 text-[10px]'>{isOpen ? '▼' : '▶'}</span>
          </div>
        </div>

        {isOpen && (
          <div className='overflow-x-auto border-t border-slate-700'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-slate-700 text-[9px] md:text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-600'>
                  <th className='px-2 py-1 font-semibold w-12'>Index</th>
                  <th className='px-2 py-1 font-semibold'>Features (X)</th>
                  <th className='px-2 py-1 font-semibold text-center'>Pred</th>
                  <th className='px-2 py-1 font-semibold text-center'>True</th>
                  <th className='px-2 py-1 font-semibold text-right'>Err</th>
                </tr>
              </thead>
              <tbody>
                {indices.map((idx, i) => {
                  const x = dataX[idx];
                  const trueDisplay =
                    dsConfig.type === 'classification'
                      ? dsConfig.classes === 2
                        ? dataY[idx][0]
                        : dataY[idx].indexOf(1)
                      : dataY[idx][0];
                  const predArray = predArrayGroup ? predArrayGroup[i] : null;

                  let predDisplay = '---', errDisplay = '---', isCorrect = false;
                  if (predArray) {
                    if (dsConfig.type === 'classification') {
                      if (dsConfig.classes === 2) {
                        const p = predArray[0];
                        predDisplay = p.toFixed(4);
                        isCorrect = (p >= 0.5 ? 1 : 0) === trueDisplay;
                        const pClipped = Math.max(1e-9, Math.min(p, 1 - 1e-9));
                        errDisplay = (
                          -(trueDisplay * Math.log(pClipped) + (1 - trueDisplay) * Math.log(1 - pClipped))
                        ).toFixed(4);
                      } else {
                        const pClass = predArray.indexOf(Math.max(...predArray));
                        predDisplay = `Class ${pClass}`;
                        isCorrect = pClass === trueDisplay;
                        const pClipped = Math.max(1e-9, Math.min(predArray[trueDisplay], 1 - 1e-9));
                        errDisplay = (-Math.log(pClipped)).toFixed(4);
                      }
                    } else {
                      predDisplay = predArray[0].toFixed(4);
                      errDisplay = Math.abs(predArray[0] - trueDisplay).toFixed(4);
                    }
                  }

                  const rowColor =
                    predArray
                      ? isCorrect && dsConfig.type === 'classification'
                        ? 'bg-emerald-900/20'
                        : dsConfig.type === 'classification'
                          ? 'bg-red-900/20'
                          : 'bg-blue-900/20'
                      : '';

                  return (
                    <tr
                      key={`${type}-${idx}-${i}`}
                      className={`border-b border-slate-700 font-mono text-[9px] md:text-[11px] ${rowColor}`}
                    >
                      <td className='px-2 py-1 text-slate-500'>#{idx}</td>
                      <td className='px-2 py-1 text-slate-300 truncate max-w-[150px]'>
                        [{x.slice(0, 4).map(v => v.toFixed(1)).join(', ')}{x.length > 4 ? '...' : ''}]
                      </td>
                      <td className='px-2 py-1 text-center font-bold text-violet-400'>
                        {predDisplay}
                      </td>
                      <td className='px-2 py-1 text-center font-bold text-slate-200'>
                        {trueDisplay}
                      </td>
                      <td className='px-2 py-1 text-right text-red-500'>{errDisplay}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='bg-slate-800 rounded-lg md:rounded-xl shadow-sm border border-slate-700 flex flex-col overflow-hidden h-fit'>
      <div
        className='bg-slate-800 p-2.5 md:p-4 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors border-b border-slate-700'
        onClick={() => setIsTableOpen(!isTableOpen)}
      >
        <h2 className='text-sm md:text-base font-bold text-white flex items-center gap-2'>
          <svg className='w-4 h-4 md:w-5 md:h-5 text-violet-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 10h16M4 14h16M4 18h16' />
          </svg>
          Data Preview &amp; Predictions
        </h2>
        <div className='text-slate-300 text-[10px] md:text-sm font-semibold'>
          {isTableOpen ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>

      {/* Stats Bar */}
      {dataLoaded && rawData && (
        <div className='bg-slate-700 px-3 md:px-4 py-2 flex flex-col gap-2 text-[10px] md:text-xs font-mono'>
          {dsConfig?.description && (
            <div className='text-slate-300 pb-1 md:pb-2 border-b border-slate-600 font-sans leading-relaxed'>
              <p className='text-[10px] md:text-[13px]'>
                {dsConfig.description}
                {dsConfig.sourceUrl && (
                  <a
                    href={dsConfig.sourceUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='ml-2 inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors'
                  >
                    Source Data
                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                    </svg>
                  </a>
                )}
              </p>
            </div>
          )}

          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 pb-1 md:pb-2 border-b border-slate-600'>
            <span className='text-slate-300'>
              <span className='text-slate-500 uppercase tracking-wide font-sans font-bold mr-1'>Size:</span>
              <span className='text-sky-300'>
                {dsConfig?.sizeBytes
                  ? dsConfig.sizeBytes > 1024 * 1024
                    ? `${(dsConfig.sizeBytes / (1024 * 1024)).toFixed(2)} MB`
                    : `${(dsConfig.sizeBytes / 1024).toFixed(0)} KB`
                  : '???'}
              </span>
            </span>
            <span className='hidden sm:inline text-slate-500'>|</span>
            <span className='text-slate-300'>
              <span className='text-slate-500 uppercase tracking-wide font-sans font-bold mr-1'>Total Rows:</span>
              <span className='text-yellow-300'>{totalRows}</span>
            </span>
            <span className='text-slate-500'>|</span>
            <span className='text-slate-300'>
              <span className='text-slate-500 uppercase tracking-wide font-sans font-bold mr-1'>Train:</span>
              <span className='text-blue-300'>{trainRows} rows</span>
              <span className='text-slate-500 mx-1'>/</span>
              <span className='text-blue-400'>{trainBatches} batches</span>
            </span>
            <span className='text-slate-500'>|</span>
            <span className='text-slate-300'>
              <span className='text-slate-500 uppercase tracking-wide font-sans font-bold mr-1'>Test:</span>
              <span className='text-orange-300'>{testRows} rows</span>
              <span className='text-slate-500 mx-1'>/</span>
              <span className='text-orange-400'>{testBatches} batches</span>
            </span>
          </div>

          <div className='flex flex-col sm:flex-row flex-nowrap items-start gap-1 sm:gap-2 w-full'>
            <span className='text-slate-500 uppercase tracking-wide font-sans font-bold min-w-max mt-0.5'>
              Features ({rawData.features.length}):
            </span>
            <div className='text-emerald-400 break-words leading-relaxed w-full max-h-24 overflow-y-auto custom-scrollbar pr-2 mt-px'>
              {rawData.features.join(' · ')}
            </div>
          </div>
        </div>
      )}

      {isTableOpen && dataSplit && (
        <div className='flex flex-col gap-0 p-2'>
          {renderPreviewTable(
            'Train', trainIndices, dataSplit.trainX, dataSplit.trainY, predictions.train,
            isTrainTableOpen, () => setIsTrainTableOpen(!isTrainTableOpen), rollTrainDice,
          )}
          {renderPreviewTable(
            'Test', testIndices, dataSplit.testX, dataSplit.testY, predictions.test,
            isTestTableOpen, () => setIsTestTableOpen(!isTestTableOpen), rollTestDice,
          )}
        </div>
      )}
    </div>
  );
}
