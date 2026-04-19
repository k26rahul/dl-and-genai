import React from 'react';
import { updateParams } from './utils';
import { X_DATA, Y_DATA } from './constants';
import { MagnifierIcon } from './assets/icons';
import MatrixView from './matrix-view';

const STAGES = [
  { id: 'input', name: 'Input', desc: 'Data', clickable: false, fwd: 'X', bwd: '' },
  { id: 'layer1', name: 'Layer 1', desc: 'W1, b1', clickable: true, fwd: 'Z1', bwd: 'dZ1' },
  { id: 'relu', name: 'Activ 1', desc: 'ReLU', clickable: true, fwd: 'A1', bwd: 'dA1' },
  { id: 'layer2', name: 'Layer 2', desc: 'W2, b2', clickable: true, fwd: 'Z2', bwd: 'dZ2' },
  { id: 'sigmoid', name: 'Activ 2', desc: 'Sigmoid', clickable: true, fwd: 'A2', bwd: 'dA2' },
  { id: 'loss', name: 'Loss', desc: 'BCE', clickable: true },
];

export default function InspectorPanel({ snap, learningRate, isOpen, setIsOpen, party, setParty }) {
  return (
    <div className='bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
      <div
        className='bg-slate-800 p-2.5 md:p-4 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors'
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className='text-sm md:text-base font-bold text-white flex items-center gap-2'>
          <MagnifierIcon className='w-4 h-4 md:w-5 md:h-5 text-violet-400' />
          Parameter &amp; Gradient Inspector (Debugger)
        </h2>
        <div className='text-slate-300 text-[10px] md:text-sm font-semibold'>
          {isOpen ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>

      {isOpen && (
        <div className='p-3 md:p-5 bg-slate-100 border-t border-slate-200'>
          <p className='text-[11px] md:text-xs text-slate-600 font-medium mb-3'>
            Click a component in the flow chart below to trace its inputs, derivatives, and update
            mechanics.
          </p>

          {/* Flow Chart */}
          <div className='mb-4 md:mb-6 w-full overflow-x-auto pb-2 custom-scrollbar bg-white p-2 md:p-3 rounded-lg shadow-sm border border-slate-200'>
            <div className='flex items-center min-w-max justify-center gap-1'>
              {STAGES.map((stage, idx, arr) => (
                <React.Fragment key={stage.id}>
                  <div
                    onClick={() => stage.clickable && setParty(stage.id)}
                    className={`w-20 md:w-28 flex flex-col items-center justify-center p-1 md:p-2 rounded-lg border-2 transition-all ${
                      !stage.clickable
                        ? 'bg-slate-50 border-slate-200 opacity-70'
                        : party === stage.id
                          ? 'border-violet-500 bg-violet-50 shadow-sm cursor-pointer scale-105'
                          : 'border-slate-200 bg-white hover:border-violet-300 cursor-pointer'
                    }`}
                  >
                    <span
                      className={`text-[10px] md:text-[11px] font-bold text-center ${
                        party === stage.id ? 'text-violet-700' : 'text-slate-700'
                      }`}
                    >
                      {stage.name}
                    </span>
                    <span className='text-[8px] md:text-[9px] text-slate-500 text-center mt-0.5'>
                      {stage.desc}
                    </span>
                  </div>

                  {idx < arr.length - 1 && (
                    <div className='flex flex-col items-center justify-center px-1 min-w-[40px] md:min-w-[55px]'>
                      <span className='text-[9px] md:text-[10px] font-bold text-blue-600 mb-[-2px] whitespace-nowrap'>
                        {stage.fwd} &rarr;
                      </span>
                      {stage.bwd ? (
                        <span className='text-[9px] md:text-[10px] font-bold text-purple-600 mt-[-2px] whitespace-nowrap'>
                          &larr; {stage.bwd}
                        </span>
                      ) : (
                        <span className='text-[9px] md:text-[10px] font-bold text-slate-300 mt-[-2px]'>
                          &larr;
                        </span>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Inspector Detail Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
            {party === 'layer1' && (
              <>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                    Forward Pass
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>Z1 = X @ W1 + b1</p>
                  <MatrixView title='X (Input Data)' data={X_DATA} />
                  <MatrixView title='W1 (Current Weights)' data={snap.W1} />
                  <MatrixView title='b1 (Current Biases)' data={snap.b1} />
                  <MatrixView title='Z1 (Output)' data={snap.Z1} />
                </div>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                    Backward Pass
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    dW1 = X.T @ dZ1<br />db1 = sum(dZ1, axis=0)
                  </p>
                  <MatrixView title='dZ1 (Incoming Grad)' data={snap.dZ1} />
                  <MatrixView title='dW1 (Computed W1 Grad)' data={snap.dW1} />
                  <MatrixView title='db1 (Computed b1 Grad)' data={snap.db1} />
                </div>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-emerald-700 mb-1 md:mb-2 border-b border-emerald-200 pb-1'>
                    Parameter Update
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    W1_new = W1 - lr * dW1<br />b1_new = b1 - lr * db1
                  </p>
                  <div className='bg-emerald-50 border border-emerald-200 rounded p-2 md:p-3 text-[10px] md:text-xs text-emerald-800 mb-3 leading-relaxed'>
                    The learning rate ({learningRate}) scales the gradient. We subtract this scaled
                    gradient from the current weights to step towards the minimum.
                  </div>
                  <MatrixView
                    title='W1 (Next Epoch Weights)'
                    data={snap.dW1 ? updateParams(snap.W1, snap.dW1, snap.b1, snap.db1, learningRate).newW : null}
                  />
                  <MatrixView
                    title='b1 (Next Epoch Biases)'
                    data={snap.db1 ? updateParams(snap.W1, snap.dW1, snap.b1, snap.db1, learningRate).newB : null}
                  />
                </div>
              </>
            )}

            {party === 'relu' && (
              <>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                    Forward Pass
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>A1 = max(0, Z1)</p>
                  <MatrixView title='Z1 (Input from Layer 1)' data={snap.Z1} />
                  <MatrixView title='A1 (Output activated)' data={snap.A1} />
                </div>
                <div className='md:col-span-2'>
                  <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                    Backward Pass (Chain Rule)
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    Local = (Z1 &gt; 0)<br />dZ1 = dA1 * Local
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4'>
                    <MatrixView title='dA1 (Incoming Grad)' data={snap.dA1} />
                    <MatrixView title='dZ1 (Grad passed back)' data={snap.dZ1} />
                  </div>
                  <p className='text-[10px] md:text-xs text-slate-600 mt-2 bg-purple-50 p-2 md:p-3 rounded leading-relaxed'>
                    <strong>Note:</strong> ReLU simply acts as a gate. If the original forward Z1
                    value was negative, the local gradient is 0. If it was positive, the local
                    gradient is 1, so the incoming dA1 gradient passes straight through untouched.
                  </p>
                </div>
              </>
            )}

            {party === 'layer2' && (
              <>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                    Forward Pass
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>Z2 = A1 @ W2 + b2</p>
                  <MatrixView title='A1 (Input from ReLU)' data={snap.A1} />
                  <MatrixView title='W2 (Current Weights)' data={snap.W2} />
                  <MatrixView title='b2 (Current Biases)' data={snap.b2} />
                  <MatrixView title='Z2 (Output)' data={snap.Z2} />
                </div>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                    Backward Pass
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    dW2 = A1.T @ dZ2<br />db2 = sum(dZ2, axis=0)
                  </p>
                  <MatrixView title='dZ2 (Incoming Grad)' data={snap.dZ2} />
                  <MatrixView title='dW2 (Computed W2 Grad)' data={snap.dW2} />
                  <MatrixView title='db2 (Computed b2 Grad)' data={snap.db2} />
                  <MatrixView title='dA1 (Grad passed back)' data={snap.dA1} />
                </div>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-emerald-700 mb-1 md:mb-2 border-b border-emerald-200 pb-1'>
                    Parameter Update
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    W2_new = W2 - lr * dW2<br />b2_new = b2 - lr * db2
                  </p>
                  <MatrixView
                    title='W2 (Next Epoch Weights)'
                    data={snap.dW2 ? updateParams(snap.W2, snap.dW2, snap.b2, snap.db2, learningRate).newW : null}
                  />
                  <MatrixView
                    title='b2 (Next Epoch Biases)'
                    data={snap.db2 ? updateParams(snap.W2, snap.dW2, snap.b2, snap.db2, learningRate).newB : null}
                  />
                </div>
              </>
            )}

            {party === 'sigmoid' && (
              <>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                    Forward Pass
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    A2 = 1 / (1 + e^-Z2)
                  </p>
                  <MatrixView title='Z2 (Raw logit Layer 2)' data={snap.Z2} />
                  <MatrixView title='A2 (Final Probability)' data={snap.A2} />
                </div>
                <div className='md:col-span-2'>
                  <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                    Backward Pass (Chain Rule)
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    Local = A2 * (1 - A2)<br />dZ2 = dA2 * Local
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4'>
                    <MatrixView title='dA2 (Incoming Grad from Loss)' data={snap.dA2} />
                    <MatrixView title='dZ2 (Grad passed back)' data={snap.dZ2} />
                  </div>
                  <p className='text-[10px] md:text-xs text-slate-600 mt-2 bg-purple-50 p-2 md:p-3 rounded leading-relaxed'>
                    <strong>Note:</strong> The local gradient of Sigmoid is maximum at 0.5 and decays
                    towards 0 at the extremes. It prevents drastic updates if the network is already
                    very confident.
                  </p>
                </div>
              </>
            )}

            {party === 'loss' && (
              <>
                <div>
                  <h4 className='font-bold text-sm md:text-base text-blue-700 mb-1 md:mb-2 border-b border-blue-200 pb-1'>
                    Forward (Evaluation)
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    Loss = BCE(A2, Y)
                  </p>
                  <MatrixView title='A2 (Predictions)' data={snap.A2} />
                  <MatrixView title='Y (True Labels)' data={Y_DATA.map(y => [y])} />
                  <div className='bg-red-50 text-red-700 p-2 md:p-3 rounded font-bold border border-red-200 flex justify-between items-center mt-2'>
                    <span className='text-xs md:text-sm'>Mean BCE Loss:</span>
                    <span className='font-mono text-base md:text-xl'>
                      {snap.loss !== null ? snap.loss.toFixed(4) : '---'}
                    </span>
                  </div>
                </div>
                <div className='md:col-span-2'>
                  <h4 className='font-bold text-sm md:text-base text-purple-700 mb-1 md:mb-2 border-b border-purple-200 pb-1'>
                    Backward (Starting Chain)
                  </h4>
                  <p className='text-[10px] md:text-xs text-slate-500 font-mono mb-2'>
                    dA2 = (-Y/A2 + (1-Y)/(1-A2)) / n
                  </p>
                  <div className='w-full sm:w-1/2'>
                    <MatrixView title='dA2 (Initial Grad sent back)' data={snap.dA2} />
                  </div>
                  <p className='text-[10px] md:text-xs text-slate-600 mt-2 bg-purple-50 p-2 md:p-3 rounded leading-relaxed'>
                    <strong>Note:</strong> This is the very beginning of Backpropagation. The Loss
                    function tells the final layer exactly how &ldquo;wrong&rdquo; it is. A large
                    positive value here means &ldquo;decrease this prediction&rdquo;, a negative
                    value means &ldquo;increase this prediction&rdquo;.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
