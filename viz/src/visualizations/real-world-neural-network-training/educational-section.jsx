import React from 'react';

export default function EducationalSection() {
  return (
    <div className='bg-blue-50 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-blue-100 flex flex-col gap-4 shadow-inner mt-4 md:mt-6'>
      <h3 className='font-bold text-blue-900 flex items-center gap-2 border-b border-blue-200 pb-2 md:pb-3 text-sm md:text-xl'>
        <svg
          className='w-4 h-4 md:w-6 md:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          ></path>
        </svg>
        Understanding Overfitting & Hyperparameters
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-xs md:text-sm text-blue-900 leading-relaxed'>
        <div className='space-y-3 md:space-y-4'>
          <div className='bg-white p-3 rounded-lg border border-blue-100 shadow-sm'>
            <h4 className='font-bold text-red-600 mb-1'>
              How to see Overfitting in Action
            </h4>
            <p className='text-slate-700'>
              To force the network to overfit, select the{' '}
              <strong>Breast Cancer</strong> or <strong>Iris</strong> dataset. Give
              the network too much "brain capacity" by selecting{' '}
              <strong>3 Hidden Layers</strong> with <strong>64 Neurons</strong> each.
              Set the learning rate to 0.01.
            </p>
            <p className='text-slate-700 mt-2'>
              Watch the Loss curve closely. The blue line (Training Loss) will
              continue to drop toward 0. But suddenly, the orange line (Testing Loss)
              will <strong>U-turn and start rocketing upwards!</strong> The network
              has stopped learning general patterns and has started blindly memorizing
              the training data, making it terrible at guessing new test data.
            </p>
          </div>

          <div>
            <h4 className='font-bold mb-1'>Why change the Batch Size?</h4>
            <p>
              <strong>Full Batch</strong> looks at the entire dataset to calculate a
              perfectly smooth, accurate gradient step. However, it can easily get
              stuck in "local minima". Using a small batch like <strong>16</strong>{' '}
              introduces "noise" to the gradients. The loss curve will look jagged and
              bouncy, but this chaotic bouncing helps the network shake itself out of
              bad local minima!
            </p>
          </div>
        </div>

        <div className='space-y-3 md:space-y-4'>
          <div>
            <h4 className='font-bold mb-1'>The Power of Learning Rate Schedules</h4>
            <ul className='list-disc pl-4 md:pl-5 space-y-1.5'>
              <li>
                <strong>Constant:</strong> Reliable, but if it's too high, the loss
                will bounce wildly at the bottom and never settle.
              </li>
              <li>
                <strong>Step / Exponential Decay:</strong> Starts fast to make big
                leaps, then slows down to carefully "tiptoe" into the deepest part of
                the minimum without overshooting.
              </li>
              <li>
                <strong>Cosine Annealing:</strong> The LR decays, but then suddenly
                jumps back up! This is a modern trick used in heavy AI models to
                intentionally "kick" the network out of a bad spot to find an even
                better minimum.
              </li>
            </ul>
          </div>

          <div className='bg-blue-100 p-3 rounded-lg border border-blue-200 mt-2'>
            <h4 className='font-bold mb-1'>Auto MPG & Regression</h4>
            <p>
              When you select Auto MPG, notice that the metric changes from Accuracy
              (%) to <strong>Mean Absolute Error (MAE)</strong>. Because we are
              predicting a continuous number (miles per gallon), we can't be "100%
              accurate". Instead, we measure how far off our prediction is in absolute
              units (e.g., an MAE of 2.5 means our guesses are off by 2.5 MPG on
              average).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
