import React from 'react';
import { BookOpenIcon } from './assets/icons';

export default function EducationalSection() {
  return (
    <div className='bg-slate-900 text-slate-100 p-3 md:p-6 rounded-xl border border-slate-800 shadow-sm'>
      <h2 className='text-sm md:text-lg font-bold text-white mb-3 md:mb-5 flex items-center gap-2 md:gap-3 border-b border-slate-700 pb-2 md:pb-3'>
        <BookOpenIcon className='w-4 h-4 md:w-5 md:h-5 text-slate-400' />
        Understanding the Mathematics of the MLP
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-xs md:text-sm leading-relaxed text-slate-300'>
        {/* Forward */}
        <div className='space-y-2 md:space-y-3'>
          <h3 className='font-bold text-sm md:text-base text-violet-300'>
            1. Forward Propagation (Predictions)
          </h3>
          <p>
            We push the entire batch of 10 samples (matrix <strong className='text-white'>X</strong>)
            through the network at once using matrix multiplication. This is incredibly fast
            compared to looping through samples one by one.
          </p>
          <div className='bg-slate-950 p-2 md:p-3 rounded-lg font-mono text-[10px] md:text-sm border border-slate-800 leading-loose overflow-x-auto'>
            Z1 = X @ W1 + b1<br />
            A1 = ReLU(Z1)<br />
            Z2 = A1 @ W2 + b2<br />
            A2 = Sigmoid(Z2){' '}
            <span className='text-slate-500'># Final Predictions</span>
          </div>
          <p>
            The <strong className='text-white'>ReLU</strong> activation turns all negative values to
            0, introducing non-linearity. The <strong className='text-white'>Sigmoid</strong>{' '}
            squishes the final output into a probability between 0 and 1.
          </p>
        </div>

        {/* Loss */}
        <div className='space-y-2 md:space-y-3'>
          <h3 className='font-bold text-sm md:text-base text-rose-300'>
            2. Loss (Evaluating Error)
          </h3>
          <p>
            Because we are doing binary classification (Y is 0 or 1), we use{' '}
            <strong className='text-white'>Binary Cross-Entropy (BCE)</strong>. It heavily
            penalizes the network if it is confident but wrong.
          </p>
          <div className='bg-slate-950 p-2 md:p-3 rounded-lg font-mono text-[10px] md:text-sm border border-slate-800 overflow-x-auto'>
            Loss = -mean(Y*log(A2) + (1-Y)*log(1-A2))
          </div>
          <p>
            Our goal is to minimize this mean Loss value across all 10 samples. Use the{' '}
            <strong className='text-white'>Inspector Panel</strong> above to see these exact
            matrix values at any paused step!
          </p>
        </div>

        {/* Backprop */}
        <div className='space-y-2 md:space-y-3'>
          <h3 className='font-bold text-sm md:text-base text-purple-300'>
            3. Backpropagation (Chain Rule)
          </h3>
          <p>
            We need to know how every single Weight and Bias contributed to the Loss. We
            calculate derivatives backwards, layer by layer, multiplying them together (The Chain
            Rule).
          </p>
          <div className='bg-slate-950 p-2 md:p-3 rounded-lg font-mono text-[10px] md:text-[13px] border border-slate-800 overflow-x-auto whitespace-pre leading-relaxed'>
            <span className='text-purple-400'># Output Layer Gradients</span>{'\n'}
            dA2 = BCE_Backward(A2, Y){'\n'}
            dZ2 = dA2 * Sigmoid_Backward(Z2){'\n'}
            dW2 = A1.T @ dZ2{' '}
            <span className='text-slate-500'># Gradients for W2</span>{'\n'}
            db2 = sum(dZ2){' '}
            <span className='text-slate-500'># Gradients for b2</span>{'\n'}
            {'\n'}
            <span className='text-purple-400'># Hidden Layer Gradients</span>{'\n'}
            dA1 = dZ2 @ W2.T{'\n'}
            dZ1 = dA1 * ReLU_Backward(Z1){'\n'}
            dW1 = X.T @ dZ1{' '}
            <span className='text-slate-500'># Gradients for W1</span>{'\n'}
            db1 = sum(dZ1){' '}
            <span className='text-slate-500'># Gradients for b1</span>
          </div>
        </div>

        {/* Update */}
        <div className='space-y-2 md:space-y-3'>
          <h3 className='font-bold text-sm md:text-base text-emerald-300'>
            4. Parameter Update
          </h3>
          <p>
            Now that we have the <strong className='text-white'>gradients</strong> (dW1, db1, dW2,
            db2), which tell us the direction of &ldquo;steepest ascent&rdquo; in the loss
            landscape, we step in the <em>opposite</em> direction.
          </p>
          <div className='bg-slate-950 p-2 md:p-3 rounded-lg font-mono text-[10px] md:text-sm border border-slate-800 leading-loose overflow-x-auto'>
            W1 = W1 - (LearningRate * dW1)<br />
            b1 = b1 - (LearningRate * db1)<br />
            W2 = W2 - (LearningRate * dW2)<br />
            b2 = b2 - (LearningRate * db2)
          </div>
          <p>
            As the epochs increase, watch the connection weights (the red and blue lines) shift
            and stabilize, and the predictions in the table slowly match the True Y values!
          </p>
        </div>
      </div>
    </div>
  );
}
