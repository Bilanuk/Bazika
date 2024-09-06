'use client'

import React from 'react'

interface StepperProps {
  totalSteps: number
  currentStep: number
}

const Stepper: React.FC<StepperProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index}>
            <Step number={index + 1} isActive={index + 1 <= currentStep} />
            {index < totalSteps - 1 && <Dots isActive={index + 1 < currentStep} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

interface StepProps {
  number: number
  isActive: boolean
}

const Step: React.FC<StepProps> = ({ number, isActive }) => {
  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
        isActive
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-muted-foreground text-muted-foreground'
      }`}
    >
      <span className="text-sm font-medium">{number}</span>
    </div>
  )
}

interface DotsProps {
  isActive: boolean
}

const Dots: React.FC<DotsProps> = ({ isActive }) => {
  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="w-16 flex justify-between">
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            className={`w-1 h-1 rounded-full ${
              isActive ? 'bg-primary' : 'bg-muted-foreground'
            }`}
          ></div>
        ))}
      </div>
    </div>
  )
}

export function StepperWrapper() {
  return (
    <div className="p-8 space-y-8">
      <Stepper totalSteps={5} currentStep={3} />
      <div className="flex justify-center space-x-4">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded">Previous</button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded">Next</button>
      </div>
    </div>
  )
}
