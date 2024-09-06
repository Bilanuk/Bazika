'use client';

import { FileUploader } from '@components/file-uploader';
import { Step, StepperWrapper } from '@components/stepper';

export default function Uploader() {
  const steps: Step[] = [
    {
      title: 'Upload',
      description: 'Upload your video file',
      content: <FileUploader />,
    },
    {
      title: 'Analyze',
      description: 'Analyze your video file',
      content: <p>Analyzing your video... Please wait.</p>, // Example content
    },
    {
      title: 'Finish',
      description: 'Finish uploading your video file',
      content: <p>Upload complete!</p>, // Example content
    },
  ];

  return <StepperWrapper steps={steps} />;
}
