import React from 'react';

export default function EducationalSection() {
  return (
    <div className='mt-8 md:mt-12 bg-white rounded-2xl md:rounded-3xl border border-slate-200 flex flex-col shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='bg-slate-800 p-4 md:p-6 text-white'>
        <h2 className='text-xl md:text-2xl font-bold flex items-center gap-3'>
          <svg
            className='w-6 h-6 md:w-8 md:h-8 text-indigo-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
            ></path>
          </svg>
          Deep Learning Handbook: Theory & Practice
        </h2>
        <p className='text-slate-300 text-sm mt-2'>
          A comprehensive guide to understanding what your neural network is actually
          doing, how it learns, and how to control it.
        </p>
      </div>

      <div className='p-4 md:p-8 space-y-12 text-slate-800 text-sm md:text-base leading-relaxed'>
        {/* 1. Problem Types & Metrics */}
        <section>
          <h3 className='text-lg md:text-xl font-extrabold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-5'>
            1. Problem Types & Metrics
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Regression */}
            <div className='bg-indigo-50/50 p-5 rounded-xl border border-indigo-100'>
              <h4 className='font-bold text-indigo-800 mb-2 flex items-center gap-2'>
                <span className='text-lg'>📈</span> Regression
              </h4>
              <p className='mb-3'>
                Predicting <strong>continuous numerical values</strong> (e.g., house
                prices, miles per gallon). The network outputs raw numbers.
              </p>
              <ul className='space-y-2 text-sm'>
                <li>
                  <strong className='text-indigo-900'>Loss (MSE):</strong>{' '}
                  <i>Mean Squared Error</i> averages the squared differences between
                  predictions and true values. Squaring heavily penalizes large errors.
                  <div className='mt-2 mb-1 flex items-center justify-start'>
                    <img
                      src='https://math.now.sh?from=MSE=\frac{1}{N}\sum(y-\hat{y})^2'
                      alt='MSE Formula'
                      className='h-8 md:h-9'
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        shapeRendering: 'geometricPrecision',
                      }}
                    />
                  </div>
                </li>
                <li>
                  <strong className='text-indigo-900'>Performance (MAE):</strong>{' '}
                  <i>Mean Absolute Error</i> is strictly the average absolute distance
                  from the truth. If predicting MPG, an MAE of 2.5 means we are off by 2.5
                  MPG on average.
                  <div className='mt-2 flex items-center justify-start'>
                    <img
                      src='https://math.now.sh?from=MAE=\frac{1}{N}\sum|y-\hat{y}|'
                      alt='MAE Formula'
                      className='h-8 md:h-9'
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        shapeRendering: 'geometricPrecision',
                      }}
                    />
                  </div>
                </li>
              </ul>
            </div>

            {/* Classification */}
            <div className='bg-emerald-50/50 p-5 rounded-xl border border-emerald-100'>
              <h4 className='font-bold text-emerald-800 mb-2 flex items-center gap-2'>
                <span className='text-lg'>&#127991;</span> Classification
              </h4>
              <p className='mb-3'>
                Categorizing samples into distinct <strong>classes</strong>. Can be{' '}
                <em>binary</em> (Malignant vs Benign) or <em>multiclass</em> (Iris
                species).
              </p>
              <ul className='space-y-2 text-sm'>
                <li>
                  <strong className='text-emerald-900'>Loss (Cross-Entropy):</strong>{' '}
                  Measures how confident the network is when guessing the correct class.
                  It heavily penalizes confident but completely wrong predictions using
                  logarithms.
                  <div className='mt-2 flex items-center justify-start'>
                    <img
                      src='https://math.now.sh?from=CE=-\sum_{i}y_i\log(p_i)'
                      alt='Cross-Entropy Formula'
                      className='h-8 md:h-9'
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        shapeRendering: 'geometricPrecision',
                      }}
                    />
                  </div>
                </li>
                <li>
                  <strong className='text-emerald-900'>Performance (Accuracy):</strong>{' '}
                  Simple percentage of correctly classified samples. We can also use
                  F1-Score for imbalanced datasets (combining Precision and Recall).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Under the Hood */}
        <section>
          <h3 className='text-lg md:text-xl font-extrabold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-5'>
            2. Under the Hood: Math & Architecture
          </h3>

          <div className='space-y-16'>
            {/* 2.1 The Neuron & Linear Algebra */}
            <div>
              <h4 className='font-bold text-xl text-slate-800 mb-4'>The Neuron & Linear Algebra</h4>
              <p className='text-slate-600 mb-4'>
                At the core of every neuron is a basic linear formula:{' '}
                <img
                  src='https://math.now.sh?from=z=(w\cdot{x})%2Bb'
                  alt='Linear Formula'
                  className='inline-block h-4 align-middle mx-1'
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    shapeRendering: 'geometricPrecision',
                  }}
                />
                . The incoming feature (<strong>x</strong>) is multiplied by a learned
                weight (<strong>w</strong>), and a bias (<strong>b</strong>) is added to
                shift the result.
              </p>
              <p className='text-slate-600 mb-6'>
                Instead of computing this one-by-one, modern networks use{' '}
                <strong>Matrices</strong>. We group many features and many weights
                together:{' '}
                <img
                  src='https://math.now.sh?from=Z=X\cdot{W}%2Bb'
                  alt='Matrix Formula'
                  className='inline-block h-4 align-middle mx-1'
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    shapeRendering: 'geometricPrecision',
                  }}
                />
                .
              </p>
              <div className='bg-slate-50 p-6 rounded-2xl border border-slate-200 flex justify-center'>
                <img
                  src='https://math.now.sh?from=\underbrace{[B \times F]}_{\text{Input Matrix}} \times \underbrace{[F \times N]}_{\text{Weight Matrix}} %2B \underbrace{[1 \times N]}_{\text{Bias Vector}} = \underbrace{[B \times N]}_{\text{Layer Output}}'
                  alt='Matrix Multiplication Shapes'
                  className='h-10 md:h-12'
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    shapeRendering: 'geometricPrecision',
                  }}
                />
              </div>
            </div>

            {/* 2.2 Backpropagation & The Chain Rule */}
            <div>
              <h4 className='font-bold text-xl text-slate-800 mb-4'>Backpropagation & The Chain Rule</h4>
              <p className='text-slate-600 mb-4'>
                A neural network is mathematically just a massive nested function call:
              </p>
              <div className='bg-slate-50 p-6 md:p-8 rounded-2xl mb-6 flex justify-center overflow-x-auto border border-slate-200'>
                <img
                  src='https://math.now.sh?from=\mathcal{L}=\text{CE}\left(\sigma\left(L_2\left(\text{ReLu}(L_1(X))\right)\right), Y_{true}\right)'
                  alt='Backpropagation Chain Rule Formula'
                  className='h-8 md:h-10'
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    shapeRendering: 'geometricPrecision',
                  }}
                />
              </div>
              <p className='text-slate-600 mb-6'>
                To learn, the network must figure out how changing one specific weight
                deep inside{' '}
                <img
                  src='https://math.now.sh?from=L_1'
                  alt='Layer 1'
                  className='inline-block h-3 align-middle mx-0.5'
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    shapeRendering: 'geometricPrecision',
                  }}
                />{' '}
                will affect the final <code>Loss</code>. It does this step-by-step backward
                from the error, applying calculus (the <strong>Chain Rule</strong>). This
                entire process is called <strong>Backpropagation</strong>.
              </p>

              <div className='bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 overflow-x-auto'>
                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-6 text-center italic'>
                  The Chained Gradient Expansion
                </span>

                <div className='space-y-8 min-w-[600px]'>
                  {/* Layer 2 Gradients */}
                  <div className='flex flex-col items-center gap-4'>
                    <span className='text-[11px] text-emerald-600 font-bold font-mono'>
                      Output Layer Gradients (L₂)
                    </span>
                    <img
                      src='https://math.now.sh?from=\frac{\partial \mathcal{L}}{\partial W_2} = \underbrace{\frac{\partial \text{CE}}{\partial \sigma}}_{\text{Loss}} \cdot \underbrace{\frac{\partial \sigma}{\partial L_2}}_{\text{Sigmoid}} \cdot \underbrace{\frac{\partial L_2}{\partial W_2}}_{\text{L2}}'
                      alt='dL/dW2'
                      className='h-16 md:h-24'
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        shapeRendering: 'geometricPrecision',
                      }}
                    />
                    <img
                      src='https://math.now.sh?from=\frac{\partial \mathcal{L}}{\partial b_2} = \underbrace{\frac{\partial \text{CE}}{\partial \sigma}}_{\text{Loss}} \cdot \underbrace{\frac{\partial \sigma}{\partial L_2}}_{\text{Sigmoid}} \cdot \underbrace{\frac{\partial L_2}{\partial b_2}}_{\text{L2}}'
                      alt='dL/db2'
                      className='h-14 md:h-20'
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        shapeRendering: 'geometricPrecision',
                      }}
                    />
                  </div>

                  <div className='h-px bg-slate-200 w-1/2 mx-auto'></div>

                  {/* Layer 1 Gradients */}
                  <div className='flex flex-col items-center gap-4'>
                    <span className='text-[11px] text-sky-600 font-bold font-mono'>
                      Hidden Layer Gradients (L₁)
                    </span>
                    <img
                      src='https://math.now.sh?from=\frac{\partial \mathcal{L}}{\partial W_1} = \underbrace{\frac{\partial \text{CE}}{\partial \sigma}}_{\text{Loss}} \cdot \underbrace{\frac{\partial \sigma}{\partial L_2}}_{\text{Sigmoid}} \cdot \underbrace{\frac{\partial L_2}{\partial \text{ReLU}}}_{\text{L2}} \cdot \underbrace{\frac{\partial \text{ReLU}}{\partial L_1}}_{\text{ReLU}} \cdot \underbrace{\frac{\partial L_1}{\partial W_1}}_{\text{L1}}'
                      alt='dL/dW1'
                      className='h-16 md:h-24'
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        shapeRendering: 'geometricPrecision',
                      }}
                    />
                    <img
                      src='https://math.now.sh?from=\frac{\partial \mathcal{L}}{\partial b_1} = \underbrace{\frac{\partial \text{CE}}{\partial \sigma}}_{\text{Loss}} \cdot \underbrace{\frac{\partial \sigma}{\partial L_2}}_{\text{Sigmoid}} \cdot \underbrace{\frac{\partial L_2}{\partial \text{ReLU}}}_{\text{L2}} \cdot \underbrace{\frac{\partial \text{ReLU}}{\partial L_1}}_{\text{ReLU}} \cdot \underbrace{\frac{\partial L_1}{\partial b_1}}_{\text{L1}}'
                      alt='dL/db1'
                      className='h-14 md:h-20'
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        shapeRendering: 'geometricPrecision',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2.3 Gradient Descent */}
            <div>
              <h4 className='font-bold text-xl text-slate-800 mb-4'>Gradient Descent</h4>
              <p className='text-slate-600 mb-4'>
                Once the gradients are calculated, we use them to nudge the weights in the direction of lower loss.
              </p>
              <div className='bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200'>
                <span className='text-[10px] font-bold text-slate-400 uppercase block mb-3 italic tracking-widest text-center'>
                  Update Step (The Optimizer Rule)
                </span>
                <div className='flex justify-center'>
                  <img
                    src='https://math.now.sh?from=w \leftarrow w - \eta \frac{\partial L}{\partial w}'
                    alt='Gradient Descent Formula'
                    className='h-10 md:h-12'
                    style={{
                      imageRendering: '-webkit-optimize-contrast',
                      shapeRendering: 'geometricPrecision',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Activation Functions */}
        <section>
          <h3 className='text-lg md:text-xl font-extrabold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-5'>
            3. Activation Functions: Adding the Non-Linear Magic
          </h3>
          <p className='mb-6'>
            Why do we use activation functions like ReLU or Sigmoid? If you nest linear
            functions without activations (e.g.,{' '}
            <img
              src='https://math.now.sh?from=L_2(L_1(X))'
              alt='Linear Function Composition'
              className='inline-block h-4 align-middle mx-1'
              style={{
                imageRendering: '-webkit-optimize-contrast',
                shapeRendering: 'geometricPrecision',
              }}
            />
            ), mathematically it collapses into just one big linear layer. The network
            would only be able to map straight lines! Activations are non-linear
            transformations that allow networks to "bend" their understanding and capture
            highly complex patterns.
          </p>

          <div className='bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-8 flex flex-col items-center'>
            <span className='text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4'>
              The "Linear Collapse" Proof
            </span>
            <img
              src="https://math.now.sh?from=f_2(f_1(x)) = (xW_1 %2B b_1)W_2 %2B b_2 = x\underbrace{(W_1W_2)}_{W'} %2B \underbrace{(b_1W_2 %2B b_2)}_{b'} = xW' %2B b'"
              alt='Mathematical Proof of Linear Collapse'
              className='h-16 md:h-20'
              style={{
                imageRendering: '-webkit-optimize-contrast',
                shapeRendering: 'geometricPrecision',
              }}
            />
            <div className='mt-6 pt-4 border-t border-indigo-100 w-full max-w-sm overflow-x-auto'>
               <table className='w-full text-[10px] text-indigo-800 border-separate border-spacing-y-1'>
                  <thead>
                    <tr className='text-indigo-400 font-bold uppercase tracking-tighter'>
                      <th className='text-left pb-1'>Part</th>
                      <th className='text-center pb-1'>Layer 1</th>
                      <th className='text-center pb-1'>Layer 2</th>
                      <th className='text-right pb-1 text-indigo-500'>Collapsed</th>
                    </tr>
                  </thead>
                  <tbody className='font-mono'>
                    <tr>
                      <td className='font-bold font-sans pr-4'>Weights (W)</td>
                      <td className='text-center text-slate-500'>[I × H]</td>
                      <td className='text-center text-slate-500'>[H × O]</td>
                      <td className='text-right font-bold text-indigo-600'>[I × O]</td>
                    </tr>
                    <tr>
                      <td className='font-bold font-sans pr-4'>Bias (b)</td>
                      <td className='text-center text-slate-500'>[1 × H]</td>
                      <td className='text-center text-slate-500'>[1 × O]</td>
                      <td className='text-right font-bold text-indigo-600'>[1 × O]</td>
                    </tr>
                  </tbody>
               </table>
            </div>

            <p className='mt-5 text-[11px] md:text-xs text-indigo-950 font-medium text-center italic'>
               No matter how many hidden layers you add, without activations, the "Deep" model collapses into this single-layer shape.
            </p>
          </div>

          <div className='bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mb-8 flex flex-col items-center'>
            <span className='text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4'>The Breakthrough: Adding ReLU</span>
            <img 
              src="https://math.now.sh?from=y = \text{ReLU}(xW_1 %2B b_1)W_2 %2B b_2 \neq xW' %2B b'" 
              alt="Breakthrough with ReLU" 
              className="h-8 md:h-10" 
              style={{ imageRendering: '-webkit-optimize-contrast', shapeRendering: 'geometricPrecision' }}
            />
            <p className='mt-5 text-[11px] md:text-xs text-emerald-900 text-center max-w-xl font-medium'>
              The "Hidden" neurons are now mathematically protected. Because the expansion is blocked, these neurons are free to learn their own <strong>distinct, specific patterns</strong> without being algebraically swallowed into a single layer. 
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm'>
              <h5 className='font-bold text-slate-800 mb-1'>ReLU</h5>
              <div className='text-[10px] text-slate-500 mb-3'>Rectified Linear Unit</div>
              <svg
                viewBox='0 0 100 100'
                className='w-full h-24 bg-slate-50 rounded border border-slate-100 mb-3'
              >
                <line x1='10' y1='50' x2='90' y2='50' stroke='#cbd5e1' strokeWidth='1' />
                <line x1='50' y1='10' x2='50' y2='90' stroke='#cbd5e1' strokeWidth='1' />
                <path
                  d='M 10 50 L 50 50 L 90 10'
                  fill='none'
                  stroke='#3b82f6'
                  strokeWidth='3'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <div className='flex justify-center mb-3 py-1'>
                <img
                  src='https://math.now.sh?from=\text{ReLU}(x) = \max(0,x)'
                  alt='ReLU Formula'
                  className='h-6'
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    shapeRendering: 'geometricPrecision',
                  }}
                />
              </div>
              <p className='text-xs text-left text-slate-600 font-medium text-slate-700'>
                Used in all hidden layers. Fast to compute, prevents gradients from
                vanishing, and blocks negative signals entirely.
              </p>
            </div>

            <div className='bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm'>
              <h5 className='font-bold text-slate-800 mb-1'>Sigmoid</h5>
              <div className='text-[10px] text-slate-500 mb-3'>S-Curve Activation</div>
              <svg
                viewBox='0 0 100 100'
                className='w-full h-24 bg-slate-50 rounded border border-slate-100 mb-3'
              >
                <line x1='10' y1='50' x2='90' y2='50' stroke='#cbd5e1' strokeWidth='1' />
                <line x1='50' y1='10' x2='50' y2='90' stroke='#cbd5e1' strokeWidth='1' />
                <path
                  d='M 10 90 Q 40 90 50 50 T 90 10'
                  fill='none'
                  stroke='#8b5cf6'
                  strokeWidth='3'
                  strokeLinecap='round'
                />
                <line
                  x1='10'
                  y1='10'
                  x2='90'
                  y2='10'
                  stroke='#e2e8f0'
                  strokeWidth='1'
                  strokeDasharray='4 4'
                />
                <line
                  x1='10'
                  y1='90'
                  x2='90'
                  y2='90'
                  stroke='#e2e8f0'
                  strokeWidth='1'
                  strokeDasharray='4 4'
                />
              </svg>
              <div className='flex justify-center mb-3 py-1'>
                <img
                  src='https://math.now.sh?from=\sigma(x) = \frac{1}{1+e^{-x}}'
                  alt='Sigmoid Formula'
                  className='h-8 md:h-10'
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    shapeRendering: 'geometricPrecision',
                  }}
                />
              </div>
              <p className='text-xs text-left text-slate-600 font-medium text-slate-700'>
                Squashes any number into a probability between 0.0 and 1.0. Exclusively
                used as the output layer for Binary Classification.
              </p>
            </div>

            <div className='bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm'>
              <h5 className='font-bold text-slate-800 mb-1'>Softmax</h5>
              <div className='text-[10px] text-slate-500 mb-3'>
                Normalized Probability
              </div>
              <div className='h-24 bg-slate-50 rounded border border-slate-100 mb-3 flex items-end justify-center gap-2 p-2'>
                <div className='w-6 bg-red-400 rounded-t' style={{ height: '20%' }}></div>
                <div
                  className='w-6 bg-emerald-400 rounded-t'
                  style={{ height: '70%' }}
                ></div>
                <div
                  className='w-6 bg-blue-400 rounded-t'
                  style={{ height: '10%' }}
                ></div>
              </div>
              <div className='flex justify-center mb-3 py-1'>
                <img
                  src='https://math.now.sh?from=\text{Softmax}(z)_i = \frac{e^{z_i}}{\sum e^{z_j}}'
                  alt='Softmax Formula'
                  className='h-10 md:h-12'
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    shapeRendering: 'geometricPrecision',
                  }}
                />
              </div>
              <p className='text-xs text-left text-slate-600 font-medium text-slate-700'>
                Used as the output layer for Multiclass Classification. It ensures all
                output neurons sum exactly to 100%.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Generalization */}
        <section className='bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-inner'>
          <h3 className='text-lg md:text-xl font-extrabold text-slate-800 mb-4'>
            4. Generalization: Underfitting vs. Overfitting
          </h3>
          <p className='mb-6'>
            The goal of training is not strictly to get 100% accuracy on the Training
            Data. The true benchmark is how well the model <strong>generalizes</strong> to
            Unseen Data (Test Data). Optimization is a delicate balancing act to stay
            right in the middle ground.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-red-50 p-4 rounded-xl border border-red-200'>
              <h4 className='font-bold text-red-800 mb-2'>Underfitting (Too Simple)</h4>
              <p className='text-sm mb-3'>
                The model lacks the capacity to capture the variations and details in the
                data. It is too rigid.
              </p>
              <ul className='text-xs space-y-1 text-red-900'>
                <li>&bull; Train Loss & Test Loss are both stubbornly high.</li>
                <li>&bull; Bad performance (low accuracy, high error).</li>
              </ul>
            </div>

            <div className='bg-orange-50 p-4 rounded-xl border border-orange-200'>
              <h4 className='font-bold text-orange-800 mb-2'>
                Overfitting (Memorization)
              </h4>
              <p className='text-sm mb-3'>
                The network structure is far too complex. Instead of learning patterns, it
                blindly memorizes the training data, making it terrible at guessing novel
                test data.
              </p>
              <ul className='text-xs space-y-1 text-orange-900'>
                <li>
                  &bull; Train Loss approaches zero, but Test Loss skyrockets upwards.
                </li>
                <li>
                  &bull; Performance gap widens (Train approaches 100% acc, Test drops
                  significantly).
                </li>
              </ul>
              <div className='mt-3 pt-3 border-t border-orange-200 text-xs text-orange-900 font-medium'>
                💡 <strong>Try this:</strong> Select the Breast Cancer dataset. Give it 3
                layers, 64 neurons each. Watch the Test Loss U-Turn upwards wildly while
                Train Loss drops! That is overfitting in action.
              </div>
            </div>
          </div>
        </section>

        {/* 5. Hyperparameters */}
        <section>
          <h3 className='text-lg md:text-xl font-extrabold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-5'>
            5. Controlling the Network: Hyperparameters
          </h3>

          <div className='space-y-8'>
            {/* LR */}
            <div>
              <h4 className='font-bold text-slate-800 text-lg mb-2'>
                Learning Rate (LR) & Scheduling
              </h4>
              <p className='mb-3'>
                The Learning Rate dictates the size of the steps the network takes during
                Gradient Descent.
              </p>
              <ul className='list-disc pl-5 mb-4 space-y-2 text-slate-700'>
                <li>
                  <strong>Tiny values:</strong> Slow learning, but very optimal and
                  stable. It might get stuck before arriving.
                </li>
                <li>
                  <strong>Large values:</strong> Fast learning, but chaotic. It may wildly
                  bounce around the minimum and never settle.
                </li>
              </ul>
              <div className='bg-white border border-slate-200 p-6 rounded-xl shadow-sm'>
                <h5 className='font-bold text-slate-800 mb-4 text-base'>
                  Learning Rate Strategies
                </h5>
                <p className='text-sm text-slate-600 mb-6'>
                  A fixed learning rate is rarely optimal. We usually start large to
                  explore the loss landscape and decay the rate over time to settle into a
                  precise minimum.
                </p>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Constant */}
                  <div className='bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='font-bold text-slate-700 text-sm'>Constant</span>
                      <svg width='60' height='20' viewBox='0 0 60 20'>
                        <line
                          x1='0'
                          y1='10'
                          x2='60'
                          y2='10'
                          stroke='#94a3b8'
                          strokeWidth='2'
                          strokeDasharray='3 2'
                        />
                      </svg>
                    </div>
                    <p className='text-xs text-slate-600 mb-3'>
                      The learning rate stays exactly the same from the first epoch to the
                      last.
                    </p>
                    <div className='mt-auto pt-2 border-t border-slate-200'>
                      <span className='text-[10px] font-bold text-slate-500 uppercase tracking-tight'>
                        When to use:
                      </span>
                      <p className='text-[11px] text-slate-500'>
                        Initial experimentation or very stable datasets with clean loss
                        surfaces.
                      </p>
                    </div>
                  </div>

                  {/* Step Decay */}
                  <div className='bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='font-bold text-amber-700 text-sm'>Step Decay</span>
                      <svg width='60' height='20' viewBox='0 0 60 20'>
                        <path
                          d='M 0 5 H 20 V 10 H 40 V 15 H 60'
                          fill='none'
                          stroke='#f59e0b'
                          strokeWidth='2'
                        />
                      </svg>
                    </div>
                    <p className='text-xs text-slate-600 mb-3'>
                      Reduces the rate by a fixed factor (e.g., 0.1) after a specific
                      number of epochs.
                    </p>
                    <div className='mt-auto pt-2 border-t border-slate-200'>
                      <span className='text-[10px] font-bold text-amber-600 uppercase tracking-tight'>
                        When to use:
                      </span>
                      <p className='text-[11px] text-slate-500'>
                        Traditional computer vision tasks or when you want the model to
                        "plateau" before dropping lower.
                      </p>
                    </div>
                  </div>

                  {/* Exponential */}
                  <div className='bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='font-bold text-rose-700 text-sm'>Exponential</span>
                      <svg width='60' height='20' viewBox='0 0 60 20'>
                        <path
                          d='M 5 2 C 5 10 20 18 58 18'
                          fill='none'
                          stroke='#f43f5e'
                          strokeWidth='2'
                          strokeLinecap='round'
                        />
                        <circle cx='5' cy='2' r='2' fill='#f43f5e' />
                      </svg>
                    </div>
                    <p className='text-xs text-slate-600 mb-3'>
                      Continuously decays the rate by a small percentage every single
                      step, creating a smooth curve.
                    </p>
                    <div className='mt-auto pt-2 border-t border-slate-200'>
                      <span className='text-[10px] font-bold text-rose-600 uppercase tracking-tight'>
                        When to use:
                      </span>
                      <p className='text-[11px] text-slate-500'>
                        Fine-tuning pre-trained models where you want a very gentle
                        transition into convergence.
                      </p>
                    </div>
                  </div>

                  {/* Cosine Annealing */}
                  <div className='bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='font-bold text-sky-700 text-sm'>
                        Cosine Annealing
                      </span>
                      <svg width='60' height='20' viewBox='0 0 60 20'>
                        <path
                          d='M 5 5 C 15 5 15 18 20 18 V 5 C 30 5 35 18 40 18 V 5 C 50 5 55 18 58 18'
                          fill='none'
                          stroke='#0ea5e9'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <circle cx='5' cy='5' r='2' fill='#0ea5e9' />
                      </svg>
                    </div>
                    <p className='text-xs text-slate-600 mb-3'>
                      Follows a cosine curve. It can "restart" (jump back up) to help the
                      model escape bad local minima.
                    </p>
                    <div className='mt-auto pt-2 border-t border-slate-200'>
                      <span className='text-[10px] font-bold text-sky-600 uppercase tracking-tight'>
                        When to use:
                      </span>
                      <p className='text-[11px] text-slate-500'>
                        Modern state-of-the-art training for deep neural networks. Often
                        yields the best final accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Size */}
            <div>
              <h4 className='font-bold text-slate-800 text-lg mb-2'>Batch Size</h4>
              <p className='mb-4 text-slate-700'>
                A dataset might have thousands of rows. When executing one training step,
                how many rows should we matrix-multiply at once before updating the
                weights?
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='bg-white p-3 rounded-lg border border-slate-200 shadow-sm'>
                  <strong className='block text-indigo-700 mb-1'>SGD (Batch = 1)</strong>
                  <p className='text-xs text-slate-600'>
                    Uses exactly one random sample per step. Extremely chaotic and
                    terribly slow on modern hardware because it wastes matrix computation
                    potential.
                  </p>
                </div>
                <div className='bg-white p-3 rounded-lg border border-slate-200 shadow-sm'>
                  <strong className='block text-indigo-700 mb-1'>
                    Mini-Batch (e.g., 16-64)
                  </strong>
                  <p className='text-xs text-slate-600'>
                    The gold standard. Taking a subset provides enough accuracy to point
                    downward, but retains enough "noise" to organically shake the network
                    out of bad local minima.
                  </p>
                </div>
                <div className='bg-white p-3 rounded-lg border border-slate-200 shadow-sm'>
                  <strong className='block text-indigo-700 mb-1'>Full Batch</strong>
                  <p className='text-xs text-slate-600'>
                    Processes every single sample to calculate a flawlessly smooth
                    gradient. It is perfectly stable, but frequently gets irreversibly
                    stuck in shallow local minima.
                  </p>
                </div>
              </div>
            </div>

            {/* Network Architecture */}
            <div>
              <h4 className='font-bold text-slate-800 text-lg mb-2'>
                Network Architecture
              </h4>
              <p className='mb-3 text-slate-700'>
                Your most vital job as an architect is managing the{' '}
                <strong>complexity balance</strong> of your hidden layers.
              </p>
              <div className='bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-slate-800'>
                The more layers and neurons you add, the more expressive power the network
                has. However, a wildly complex model is actively dangerous: if you deploy
                3 layers of 64 neurons to solve a trivial dataset (like Titanic or Iris),
                it behaves like a supercomputer assigned to solve basic arithmetic—it will{' '}
                <strong>overfit</strong> instantly by perfectly memorizing the noise,
                shattering its generalization capability. Start small!
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
