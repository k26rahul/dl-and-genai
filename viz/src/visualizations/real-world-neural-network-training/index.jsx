import React from 'react';
import Visualization from './visualization';
import EducationalSection from './educational-section';

export default function RealWorldNeuralNetworkTraining() {
  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-2 md:p-4 font-sans'>
      <div className='max-w-7xl mx-auto'>
        <Visualization />
        <EducationalSection />
      </div>
    </div>
  );
}
