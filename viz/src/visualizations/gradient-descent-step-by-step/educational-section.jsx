import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import { BookIcon } from './assets/icons';

export default function EducationalSection() {
  return (
    <div className='bg-slate-900 p-3 md:p-5 rounded-xl border border-slate-800 flex flex-col gap-2 md:gap-3'>
      <h3 className='font-bold text-white flex items-center gap-1.5 md:gap-2 border-b border-slate-700 pb-1.5 md:pb-2 text-sm md:text-base'>
        <BookIcon className='w-4 h-4 md:w-5 md:h-5 text-slate-400' />
        Understanding Gradient Descent
      </h3>

      <div className='text-xs md:text-sm text-slate-300 space-y-2 md:space-y-3 max-w-5xl mx-auto w-full'>
        <p>
          <strong className='text-white'>1. The Derivative (Slope):</strong> The slope of the
          tangent line represents the <em>instantaneous rate of change</em> of our function. This
          is our <strong className='text-white'>derivative</strong> value.
        </p>

        <div className='bg-slate-800 p-2 md:p-3 rounded-lg border border-slate-700 space-y-1.5 md:space-y-2'>
          <p>
            <strong className='text-white'>2. Finding the Minimum:</strong> Our goal is to reach
            the lowest value of the function. The derivative tells us the function&apos;s behavior
            as we move forward (→):
          </p>
          <ul className='list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 text-slate-400'>
            <li>
              If the slope is{' '}
              <span className='font-semibold text-emerald-400'>Positive</span>, the function value
              is increasing (↑). To go down toward the minimum, we must move backward{' '}
              <strong className='text-white'>(←)</strong>.
            </li>
            <li>
              If the slope is <span className='font-semibold text-rose-400'>Negative</span>, the
              function value is decreasing (↓). To go down toward the minimum, we must keep moving
              forward <strong className='text-white'>(→)</strong>.
            </li>
          </ul>
        </div>

        <p>
          <strong className='text-white'>3. Taking a Step:</strong> How big of a step do we take?
          We multiply the derivative by a{' '}
          <strong className='text-white'>Learning Rate</strong>.
        </p>

        <div className='bg-slate-950 border border-slate-700 rounded-lg p-2 md:p-3 flex justify-center shadow-inner max-w-lg mx-auto w-full text-white'>
          <TeX math="\Delta x = -\eta \cdot f'(x)" />
        </div>

        <p>
          Notice the <strong className='text-white'>negative sign</strong>! We take the negative of
          this product because we want to move <em>opposite</em> to the slope. For a positive slope,
          we want a decrease in X (←). For a negative slope, we want an increase in X (→).
        </p>

        <div className='bg-slate-800 p-2 md:p-3 rounded-lg border border-slate-700'>
          <p className='font-semibold text-white mb-1 md:mb-2'>4. The Impact of Learning Rate:</p>
          <ul className='list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 text-slate-400'>
            <li>
              <strong className='text-white'>Small Learning Rate:</strong> Safe, tiny steps. You
              will carefully reach the minimum, but it might take many steps.
            </li>
            <li>
              <strong className='text-white'>Large Learning Rate:</strong> Fast, huge steps. You
              risk overshooting the minimum entirely and bouncing out of control!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
