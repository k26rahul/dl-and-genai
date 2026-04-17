import React from 'react';

export default function EducationalSection() {
  return (
    <div className='mt-8 md:mt-12 bg-white rounded-2xl md:rounded-3xl border border-slate-200 flex flex-col shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='bg-slate-800 p-4 md:p-6 text-white'>
        <h2 className='text-xl md:text-2xl font-bold flex items-center gap-3'>
          <svg className='w-6 h-6 md:w-8 md:h-8 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'></path>
          </svg>
          Deep Learning Handbook: Theory & Practice
        </h2>
        <p className='text-slate-300 text-sm mt-2'>
          A comprehensive guide to understanding what your neural network is actually doing, how it learns, and how to control it.
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
                Predicting <strong>continuous numerical values</strong> (e.g., house prices, miles per gallon). The network outputs raw numbers.
              </p>
              <ul className='space-y-2 text-sm'>
                <li>
                  <strong className='text-indigo-900'>Loss (MSE):</strong> <i>Mean Squared Error</i> averages the squared differences between predictions and true values: <code>MSE = 1/N &Sigma;(y - y&circ;)&sup2;</code>. Squaring heavily penalizes large errors.
                </li>
                <li>
                  <strong className='text-indigo-900'>Performance (MAE):</strong> <i>Mean Absolute Error</i> is strictly the average absolute distance from the truth: <code>MAE = 1/N &Sigma;|y - y&circ;|</code>. If predicting MPG, an MAE of 2.5 means we are off by 2.5 MPG on average.
                </li>
              </ul>
            </div>

            {/* Classification */}
            <div className='bg-emerald-50/50 p-5 rounded-xl border border-emerald-100'>
              <h4 className='font-bold text-emerald-800 mb-2 flex items-center gap-2'>
                <span className='text-lg'>&#127991;</span> Classification
              </h4>
              <p className='mb-3'>
                Categorizing samples into distinct <strong>classes</strong>. Can be <em>binary</em> (Malignant vs Benign) or <em>multiclass</em> (Iris species).
              </p>
              <ul className='space-y-2 text-sm'>
                <li>
                  <strong className='text-emerald-900'>Loss (Cross-Entropy):</strong> Measures how confident the network is when guessing the correct class. It heavily penalizes confident but completely wrong predictions using logarithms: <code>CE = -&Sigma; y * log(p)</code>.
                </li>
                <li>
                  <strong className='text-emerald-900'>Performance (Accuracy):</strong> Simple percentage of correctly classified samples. We can also use F1-Score for imbalanced datasets (combining Precision and Recall).
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
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div>
              <h4 className='font-bold mb-2'>The Neuron & Linear Algebra</h4>
              <p className='mb-3'>
                At the core of every neuron is a basic linear formula: <code>z = (w * x) + b</code>. The incoming feature (<strong>x</strong>) is multiplied by a learned weight (<strong>w</strong>), and a bias (<strong>b</strong>) is added to shift the result.
              </p>
              <p className='mb-3'>
                Instead of computing this one-by-one, modern networks use <strong>Matrices</strong>. We group many features and many weights together: <code>Z = X &times; W + b</code>. 
              </p>
              <div className='bg-slate-100 p-3 rounded font-mono text-xs overflow-x-auto whitespace-pre'>
                {`[Batch, Features] * [Features, Neurons] = [Batch, Neurons]
  (Input Data Matrix)       (Weight Matrix)       (Layer Output)`}
              </div>
            </div>

            <div>
              <h4 className='font-bold mb-2'>Backpropagation & The Chain Rule</h4>
              <p className='mb-2'>
                A neural network is mathematically just a massive nested function call:
              </p>
              <div className='bg-slate-800 text-sky-300 p-3 rounded font-mono text-xs mb-3 overflow-x-auto'>
                Loss = cross_entropy( sigmoid( lin3( relu( lin2( relu( lin1( X ) ) ) ) ) ), True_Y )
              </div>
              <p>
                To learn, the network must figure out how changing one specific weight deep inside <code>lin1</code> will affect the final <code>Loss</code>. It does this step-by-step backward from the error, applying calculus (the <strong>Chain Rule</strong>). This process of moving the error backward to update weights via Gradient Descent is called <strong>Backpropagation</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Activation Functions */}
        <section>
          <h3 className='text-lg md:text-xl font-extrabold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-5'>
            3. Activation Functions: Adding the Non-Linear Magic
          </h3>
          <p className='mb-6'>
            Why do we use activation functions like ReLU or Sigmoid? If you nest linear functions without activations (e.g., <code>lin2(lin1(X))</code>), mathematically it collapses into just one big linear layer. The network would only be able to map straight lines! Activations are non-linear transformations that allow networks to "bend" their understanding and capture highly complex patterns.
          </p>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm'>
              <h5 className='font-bold text-slate-800 mb-1'>ReLU</h5>
              <div className='text-[10px] text-slate-500 mb-3'>Rectified Linear Unit &middot; <code>max(0, x)</code></div>
              <svg viewBox='0 0 100 100' className='w-full h-24 bg-slate-50 rounded border border-slate-100 mb-3'>
                <line x1='10' y1='50' x2='90' y2='50' stroke='#cbd5e1' strokeWidth='1' />
                <line x1='50' y1='10' x2='50' y2='90' stroke='#cbd5e1' strokeWidth='1' />
                <path d='M 10 50 L 50 50 L 90 10' fill='none' stroke='#3b82f6' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              <p className='text-xs text-left text-slate-600'>Used in all hidden layers. Fast to compute, prevents gradients from vanishing, and blocks negative signals entirely.</p>
            </div>

            <div className='bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm'>
              <h5 className='font-bold text-slate-800 mb-1'>Sigmoid</h5>
              <div className='text-[10px] text-slate-500 mb-3'>S-Curve &middot; <code>1 / (1 + e^-x)</code></div>
              <svg viewBox='0 0 100 100' className='w-full h-24 bg-slate-50 rounded border border-slate-100 mb-3'>
                <line x1='10' y1='50' x2='90' y2='50' stroke='#cbd5e1' strokeWidth='1' />
                <line x1='50' y1='10' x2='50' y2='90' stroke='#cbd5e1' strokeWidth='1' />
                <path d='M 10 90 Q 40 90 50 50 T 90 10' fill='none' stroke='#8b5cf6' strokeWidth='3' strokeLinecap='round' />
                <line x1='10' y1='10' x2='90' y2='10' stroke='#e2e8f0' strokeWidth='1' strokeDasharray='4 4' />
                <line x1='10' y1='90' x2='90' y2='90' stroke='#e2e8f0' strokeWidth='1' strokeDasharray='4 4' />
              </svg>
              <p className='text-xs text-left text-slate-600'>Squashes any number into a probability between 0.0 and 1.0. Exclusively used as the output layer for Binary Classification.</p>
            </div>

            <div className='bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm'>
              <h5 className='font-bold text-slate-800 mb-1'>Softmax</h5>
              <div className='text-[10px] text-slate-500 mb-3'>Relative Probabilities</div>
              <div className='h-24 bg-slate-50 rounded border border-slate-100 mb-3 flex items-end justify-center gap-2 p-2'>
                <div className='w-6 bg-red-400 rounded-t' style={{ height: '20%' }}></div>
                <div className='w-6 bg-emerald-400 rounded-t' style={{ height: '70%' }}></div>
                <div className='w-6 bg-blue-400 rounded-t' style={{ height: '10%' }}></div>
              </div>
              <p className='text-xs text-left text-slate-600'>Used as the output layer for Multiclass Classification. It ensures all output neurons sum exactly to 100%.</p>
            </div>
          </div>
        </section>

        {/* 4. Generalization */}
        <section className='bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-inner'>
          <h3 className='text-lg md:text-xl font-extrabold text-slate-800 mb-4'>
            4. Generalization: Underfitting vs. Overfitting
          </h3>
          <p className='mb-6'>
            The goal of training is not strictly to get 100% accuracy on the Training Data. The true benchmark is how well the model <strong>generalizes</strong> to Unseen Data (Test Data).
            Optimization is a delicate balancing act to stay right in the middle ground.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-red-50 p-4 rounded-xl border border-red-200'>
              <h4 className='font-bold text-red-800 mb-2'>Underfitting (Too Simple)</h4>
              <p className='text-sm mb-3'>
                The model lacks the capacity to capture the variations and details in the data. It is too rigid.
              </p>
              <ul className='text-xs space-y-1 text-red-900'>
                <li>&bull; Train Loss & Test Loss are both stubbornly high.</li>
                <li>&bull; Bad performance (low accuracy, high error).</li>
              </ul>
            </div>

            <div className='bg-orange-50 p-4 rounded-xl border border-orange-200'>
              <h4 className='font-bold text-orange-800 mb-2'>Overfitting (Memorization)</h4>
              <p className='text-sm mb-3'>
                The network structure is far too complex. Instead of learning patterns, it blindly memorizes the training data, making it terrible at guessing novel test data.
              </p>
              <ul className='text-xs space-y-1 text-orange-900'>
                <li>&bull; Train Loss approaches zero, but Test Loss skyrockets upwards.</li>
                <li>&bull; Performance gap widens (Train approaches 100% acc, Test drops significantly).</li>
              </ul>
              <div className='mt-3 pt-3 border-t border-orange-200 text-xs text-orange-900 font-medium'>
                💡 <strong>Try this:</strong> Select the Breast Cancer dataset. Give it 3 layers, 64 neurons each. Watch the Test Loss U-Turn upwards wildly while Train Loss drops! That is overfitting in action.
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
              <h4 className='font-bold text-slate-800 text-lg mb-2'>Learning Rate (LR) & Scheduling</h4>
              <p className='mb-3'>
                The Learning Rate dictates the size of the steps the network takes during Gradient Descent.
              </p>
              <ul className='list-disc pl-5 mb-4 space-y-2 text-slate-700'>
                <li><strong>Tiny values:</strong> Slow learning, but very optimal and stable. It might get stuck before arriving.</li>
                <li><strong>Large values:</strong> Fast learning, but chaotic. It may wildly bounce around the minimum and never settle.</li>
              </ul>
              <div className='bg-white border border-slate-200 p-4 rounded-xl shadow-sm'>
                <h5 className='font-bold text-slate-700 mb-2 text-sm'>Why use an LR Schedule?</h5>
                <p className='text-sm text-slate-600 mb-3'>
                  At the beginning of training, we should take massive leaps to escape flat regions and quickly approach the area of minimum loss. However, once we get close, we need to decay the LR to take tiny, delicate "tiptoe" steps to settle into the exact lowest point without overshooting it.
                </p>
                <div className='flex gap-4 text-xs font-mono overflow-x-auto'>
                  <span className='px-2 py-1 bg-slate-100 rounded border border-slate-200'>Constant</span>
                  <span className='px-2 py-1 bg-slate-100 rounded border border-slate-200'>Step Decay</span>
                  <span className='px-2 py-1 bg-slate-100 rounded border border-slate-200 text-sky-700'>Cosine: Decays, then 'kicks' back up to escape traps.</span>
                </div>
              </div>
            </div>

            {/* Batch Size */}
            <div>
              <h4 className='font-bold text-slate-800 text-lg mb-2'>Batch Size</h4>
              <p className='mb-4 text-slate-700'>
                A dataset might have thousands of rows. When executing one training step, how many rows should we matrix-multiply at once before updating the weights?
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='bg-white p-3 rounded-lg border border-slate-200 shadow-sm'>
                  <strong className='block text-indigo-700 mb-1'>SGD (Batch = 1)</strong>
                  <p className='text-xs text-slate-600'>Uses exactly one random sample per step. Extremely chaotic and terribly slow on modern hardware because it wastes matrix computation potential.</p>
                </div>
                <div className='bg-white p-3 rounded-lg border border-slate-200 shadow-sm'>
                  <strong className='block text-indigo-700 mb-1'>Mini-Batch (e.g., 16-64)</strong>
                  <p className='text-xs text-slate-600'>The gold standard. Taking a subset provides enough accuracy to point downward, but retains enough "noise" to organically shake the network out of bad local minima.</p>
                </div>
                <div className='bg-white p-3 rounded-lg border border-slate-200 shadow-sm'>
                  <strong className='block text-indigo-700 mb-1'>Full Batch</strong>
                  <p className='text-xs text-slate-600'>Processes every single sample to calculate a flawlessly smooth gradient. It is perfectly stable, but frequently gets irreversibly stuck in shallow local minima.</p>
                </div>
              </div>
            </div>

            {/* Network Architecture */}
            <div>
              <h4 className='font-bold text-slate-800 text-lg mb-2'>Network Architecture</h4>
              <p className='mb-3 text-slate-700'>
                Your most vital job as an architect is managing the <strong>complexity balance</strong> of your hidden layers.
              </p>
              <div className='bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-slate-800'>
                The more layers and neurons you add, the more expressive power the network has. 
                However, a wildly complex model is actively dangerous: if you deploy 3 layers of 64 neurons to solve a trivial dataset (like Titanic or Iris), it behaves like a supercomputer assigned to solve basic arithmetic—it will <strong>overfit</strong> instantly by perfectly memorizing the noise, shattering its generalization capability. Start small!
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
