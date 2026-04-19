import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
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
            We push the entire batch of 10 samples (matrix <strong className='text-white'><TeX math='X' /></strong>)
            through the network at once using matrix multiplication. This is incredibly fast
            compared to looping through samples one by one.
          </p>
          <div className='bg-slate-950 p-2 md:p-3 rounded-lg text-[10px] md:text-[13px] border border-slate-800 flex flex-col gap-1.5 overflow-x-auto whitespace-nowrap text-slate-300'>
            <div><TeX math='Z_1 = X W_1 + b_1' /></div>
            <div><TeX math='A_1 = \text{ReLU}(Z_1)' /></div>
            <div><TeX math='Z_2 = A_1 W_2 + b_2' /></div>
            <div className='flex items-center'>
              <TeX math='A_2 = \sigma(Z_2)' />
              <span className='text-slate-500 ml-4'># Final Predictions</span>
            </div>
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
            Because we are doing binary classification (<TeX math='Y \in \{0, 1\}' />), we use{' '}
            <strong className='text-white'>Binary Cross-Entropy (BCE)</strong>. It heavily
            penalizes the network if it is confident but wrong.
          </p>
          <div className='bg-slate-950 p-2 md:p-3 rounded-lg text-[10px] md:text-[13px] border border-slate-800 overflow-x-auto text-slate-300'>
            <TeX math='\mathcal{L} = -\frac{1}{n} \sum_{i=1}^n \left( Y_i \log(A_{2,i}) + (1-Y_i) \log(1-A_{2,i}) \right)' />
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
          <div className='bg-slate-950 p-2 md:p-3 rounded-lg text-[10px] md:text-[13px] border border-slate-800 flex flex-col gap-1.5 overflow-x-auto whitespace-nowrap text-slate-300'>
            <div className='text-purple-400 mb-1 mt-1 font-mono'># Output Layer Gradients</div>
            <div><TeX math='dA_2 = \nabla_{A_2} \text{BCE}(A_2, Y)' /></div>
            <div><TeX math='dZ_2 = dA_2 \odot \sigma^\prime(Z_2)' /></div>
            <div className='flex items-center'><TeX math='dW_2 = A_1^T dZ_2' /><span className='text-slate-500 ml-4 font-mono'># Gradients for <TeX math='W_2' /></span></div>
            <div className='flex items-center'><TeX math='db_2 = \sum_{batch} dZ_2' /><span className='text-slate-500 ml-4 font-mono'># Gradients for <TeX math='b_2' /></span></div>
            <div className='h-2'></div>
            <div className='text-purple-400 mb-1 font-mono'># Hidden Layer Gradients</div>
            <div><TeX math='dA_1 = dZ_2 W_2^T' /></div>
            <div><TeX math='dZ_1 = dA_1 \odot \text{ReLU}^\prime(Z_1)' /></div>
            <div className='flex items-center'><TeX math='dW_1 = X^T dZ_1' /><span className='text-slate-500 ml-4 font-mono'># Gradients for <TeX math='W_1' /></span></div>
            <div className='flex items-center'><TeX math='db_1 = \sum_{batch} dZ_1' /><span className='text-slate-500 ml-4 font-mono'># Gradients for <TeX math='b_1' /></span></div>
          </div>
        </div>

        {/* Update */}
        <div className='space-y-2 md:space-y-3'>
          <h3 className='font-bold text-sm md:text-base text-emerald-300'>
            4. Parameter Update
          </h3>
          <p>
            Now that we have the <strong className='text-white'>gradients</strong> (<TeX math='dW_1, db_1, dW_2, db_2' />),
            which tell us the direction of &ldquo;steepest ascent&rdquo; in the loss
            landscape, we step in the <em>opposite</em> direction.
          </p>
          <div className='bg-slate-950 p-2 md:p-3 rounded-lg text-[10px] md:text-[13px] border border-slate-800 flex flex-col gap-1.5 overflow-x-auto text-slate-300'>
            <div><TeX math='W_1 \leftarrow W_1 - \eta \cdot dW_1' /></div>
            <div><TeX math='b_1 \leftarrow b_1 - \eta \cdot db_1' /></div>
            <div><TeX math='W_2 \leftarrow W_2 - \eta \cdot dW_2' /></div>
            <div><TeX math='b_2 \leftarrow b_2 - \eta \cdot db_2' /></div>
          </div>
          <p>
            As the epochs increase, watch the connection weights (the red and blue lines) shift
            and stabilize, and the predictions in the table slowly match the True <TeX math='Y' /> values!
          </p>
        </div>
      </div>
    </div>
  );
}
