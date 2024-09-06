'use client';

import React, { useState } from 'react';

export interface Step {
  title: string;
  description: string;
  content: React.ReactNode;
}

interface StepperWrapperProps {
  steps: Step[];
}

export function StepperWrapper({ steps }: StepperWrapperProps) {
  const [currentStep, setCurrentStep] = useState(1); // Start from step 1

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className='space-y-8 p-8'>
      <Stepper totalSteps={steps.length} currentStep={currentStep} />

      {/* Dynamic content for each step */}
      <div className='flex flex-col items-center'>
        <h2 className='text-xl font-bold'>{steps[currentStep - 1].title}</h2>
        <p className='text-gray-600'>{steps[currentStep - 1].description}</p>
        <div className='mt-4 w-full'>{steps[currentStep - 1].content}</div>
      </div>

      {/* Navigation buttons */}
      <div className='flex justify-center space-x-4'>
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`rounded px-4 py-2 ${
            currentStep === 1
              ? 'cursor-not-allowed bg-gray-300'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className={`rounded px-4 py-2 ${
            currentStep === steps.length
              ? 'cursor-not-allowed bg-gray-300'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

interface StepperProps {
  totalSteps: number;
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className='mx-auto w-full max-w-3xl'>
      <div className='flex items-center justify-between'>
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index}>
            <Step number={index + 1} isActive={index + 1 <= currentStep} />
            {index < totalSteps - 1 && (
              <Dots isActive={index + 1 < currentStep} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

interface StepProps {
  number: number;
  isActive: boolean;
}

const Step: React.FC<StepProps> = ({ number, isActive }) => {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
        isActive
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-muted-foreground text-muted-foreground'
      }`}
    >
      <span className='text-sm font-medium'>{number}</span>
    </div>
  );
};

interface DotsProps {
  isActive: boolean;
}

const Dots: React.FC<DotsProps> = ({ isActive }) => {
  return (
    <div className='flex flex-1 items-center justify-center'>
      <div className='flex w-16 justify-between'>
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            className={`h-1 w-1 rounded-full ${
              isActive ? 'bg-primary' : 'bg-muted-foreground'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};
