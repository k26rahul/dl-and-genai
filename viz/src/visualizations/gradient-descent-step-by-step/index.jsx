import React from 'react';
import Visualization from './visualization';
import EducationalSection from './educational-section';

export default function GradientDescentStepByStep() {
  return (
    <div className='min-h-screen bg-slate-900 text-slate-200 p-1 sm:p-2 md:p-4 font-sans'>
      <div className='max-w-6xl mx-auto'>
        <header className='mb-2 md:mb-3 text-center'>
          <h1 className='text-lg md:text-2xl font-bold tracking-tight text-white mb-0.5 md:mb-1'>
            Gradient Descent: Step by Step
          </h1>
          <p className='text-[11px] md:text-sm text-slate-400'>
            See exactly how the math computes the next position on the curve.
          </p>
        </header>

        <Visualization />

        <div className='mt-3 md:mt-5 w-full'>
          <EducationalSection />
        </div>
      </div>
    </div>
  );
}
