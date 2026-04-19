import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import { InfoIcon } from './assets/icons';

export default function EducationalSection() {
  return (
    <div className='bg-slate-900 p-3 md:p-5 rounded-xl border border-slate-800 flex flex-col gap-2 md:gap-3'>
      <h3 className='font-bold text-white flex items-center gap-1.5 md:gap-2 border-b border-slate-700 pb-1.5 md:pb-2 text-sm md:text-base'>
        <InfoIcon className='w-4 h-4 md:w-5 md:h-5 text-slate-400' />
        Partial Derivatives
      </h3>

      <div className='text-xs md:text-sm text-slate-300 space-y-2 md:space-y-3 max-w-5xl mx-auto w-full'>
        <p>
          <strong className='text-white'>1. What is a Partial Derivative?</strong> Because our
          surface has two inputs (X and Y), we must look at them one at a time. The partial
          derivative{' '}
          <strong className='text-white'>
            <TeX math='\partial Z / \partial X' />
          </strong>{' '}
          is the change in Z with respect to X, <em>assuming Y is strictly constant</em>.
          Similarly,{' '}
          <strong className='text-white'>
            <TeX math='\partial Z / \partial Y' />
          </strong>{' '}
          is the change in Z with respect to Y, <em>assuming X is strictly constant</em>.
        </p>

        <div className='bg-slate-800 p-2 md:p-3 rounded-lg border border-slate-700 space-y-1.5 md:space-y-2'>
          <p>
            <strong className='text-white'>2. Two Directions to Minimize:</strong> The rules for
            finding the minimum apply independently to both axes (X and Y):
          </p>
          <ul className='list-disc pl-4 md:pl-5 space-y-1 text-slate-400'>
            <li>
              <strong className='text-white'>
                If a partial derivative is{' '}
                <span className='text-emerald-400'>Positive</span>:
              </strong>{' '}
              Moving forward along that axis makes Z increase (↑). To go down toward the
              minimum, we must move <strong className='text-white'>backward (←)</strong> on that
              axis.
            </li>
            <li>
              <strong className='text-white'>
                If a partial derivative is{' '}
                <span className='text-rose-400'>Negative</span>:
              </strong>{' '}
              Moving forward along that axis makes Z decrease (↓). To go down toward the
              minimum, we must keep moving <strong className='text-white'>forward (→)</strong> on
              that axis.
            </li>
          </ul>
        </div>

        <p>
          <strong className='text-white'>3. The Combined Step:</strong> Gradient descent combines
          both corrections simultaneously. We multiply each partial derivative by the Learning
          Rate and subtract them from our current coordinates:
        </p>

        <div className='bg-slate-950 border border-slate-700 rounded-lg p-2 md:p-3 flex justify-center shadow-inner max-w-lg mx-auto w-full text-white'>
          <TeX block math='\begin{aligned} x_{new} &= x - \eta \cdot \tfrac{\partial Z}{\partial X} \\ y_{new} &= y - \eta \cdot \tfrac{\partial Z}{\partial Y} \end{aligned}' />
        </div>

        <div className='bg-slate-800 p-2 md:p-3 rounded-lg border border-slate-700'>
          <p className='font-semibold text-white mb-1'>4. Navigating the 3D Terrain:</p>
          <p className='text-slate-400'>
            By following the <strong className='text-white'>solid gray dot</strong>, we walk down
            the steepest path of the surface. Try selecting the{' '}
            <strong className='text-white'>Saddle Point</strong> or{' '}
            <strong className='text-white'>Himmelblau</strong> to see how the dot navigates
            complex ridges and valleys!
          </p>
        </div>
      </div>
    </div>
  );
}
