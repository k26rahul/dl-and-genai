import React from 'react';
import Visualization from './visualization';
import EducationalSection from './educational-section';

export default function GradientDescent3D() {
  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-1 sm:p-2 md:p-4 font-sans'>
      <div className='max-w-7xl mx-auto'>
        <header className='mb-2 md:mb-3 text-center'>
          <h1 className='text-lg md:text-2xl font-bold tracking-tight text-slate-900 mb-0.5 md:mb-1'>
            3D Gradient Descent: Partial Derivatives
          </h1>
          <p className='text-[11px] md:text-sm text-slate-500'>
            Explore how optimizing two parameters creates a trajectory over a 3D surface.
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
