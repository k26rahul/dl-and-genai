import React from 'react';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import { FlaskIcon } from './assets/icons';

export default function EducationalSection() {
  return (
    <div className='bg-slate-900 p-3 md:p-5 rounded-xl border border-slate-800 flex flex-col gap-2 md:gap-3'>
      <h3 className='font-bold text-white flex items-center gap-1.5 md:gap-2 border-b border-slate-700 pb-1.5 md:pb-2 text-sm md:text-base'>
        <FlaskIcon className='w-4 h-4 md:w-5 md:h-5 text-slate-400' />
        Understanding Gradient Descent in Higher Dimensions
      </h3>

      <div className='text-xs md:text-sm text-slate-300 space-y-2 md:space-y-3 max-w-5xl mx-auto w-full'>
        <div className='space-y-1'>
          <strong className='text-white'>1. Where did the Surface Plot go?</strong> The previous
          visualizations had 1 or 2 inputs and 1 output, making 2D lines and 3D surfaces. Here,
          we have <strong className='text-white'>5 inputs and 1 output</strong>. This forms a
          mathematical surface in{' '}
          <strong className='text-white'>
            <TeX math='f: \mathbb{R}^5 \to \mathbb{R}' />
          </strong>
          ! Since human brains cannot visualize 6D space, we cannot plot the surface anymore.
        </div>

        <div className='space-y-1'>
          <strong className='text-white'>2. The Epoch vs. Output Plot:</strong> Because we
          can&apos;t see the 6D landscape, we track progress using a{' '}
          <strong className='text-white'>Loss Curve</strong>.
          <ul className='list-disc pl-4 md:pl-5 mt-1 space-y-1 text-slate-400'>
            <li>
              The <strong className='text-white'>Y-axis</strong> is our Output (Z), which we want
              to minimize.
            </li>
            <li>
              The <strong className='text-white'>X-axis</strong> is the{' '}
              <strong className='text-white'>Epoch</strong> (each time we take a step).
            </li>
          </ul>
          As the algorithm runs, you will see the line drop, proving we are walking
          &ldquo;downhill&rdquo; in 6D space, even if we can&apos;t see the hill!
        </div>

        <div className='bg-slate-800 p-2 md:p-3 rounded-lg border border-slate-700 space-y-1.5'>
          <p>
            <strong className='text-white'>3. The Math is Exactly the Same:</strong> It
            doesn&apos;t matter if we have 2 parameters or 5 billion parameters (like modern AI
            models). The mechanism generalizes perfectly:
          </p>
          <ul className='list-disc pl-4 md:pl-5 space-y-1 text-slate-400'>
            <li>
              We calculate the{' '}
              <strong className='text-white'>
                partial derivative (<TeX math='\nabla f' />)
              </strong>{' '}
              for every single parameter.
            </li>
            <li>
              <strong className='text-white'>
                If a partial derivative is{' '}
                <span className='text-emerald-400'>Positive</span>:
              </strong>{' '}
              To go down toward the minimum, we move{' '}
              <strong className='text-white'>backward (←)</strong> on that parameter.
            </li>
            <li>
              <strong className='text-white'>
                If a partial derivative is{' '}
                <span className='text-rose-400'>Negative</span>:
              </strong>{' '}
              To go down toward the minimum, we keep moving{' '}
              <strong className='text-white'>forward (→)</strong> on that parameter.
            </li>
            <li>
              We update <strong className='text-white'>all 5 parameters simultaneously</strong>{' '}
              using the exact same formula:
              <div className='mt-1.5 bg-slate-950 border border-slate-700 rounded-lg p-2 flex justify-center'>
                <TeX math='x_{i,\,new} = x_{i,\,curr} - \eta \cdot \frac{\partial Z}{\partial x_i}' />
              </div>
            </li>
          </ul>
        </div>

        <div className='space-y-1'>
          <strong className='text-white'>Try it yourself:</strong> Grab any slider and move it.
          You will see the Epoch reset to 0, and the Loss Curve spike upward (because you moved
          away from the minimum). Then, hit <strong className='text-white'>Auto</strong> and watch
          the algorithm automatically slide all 5 parameters back to their perfect, optimal
          positions!
        </div>
      </div>
    </div>
  );
}
