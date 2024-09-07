'use client';

import { FileUploader } from '@components/file-uploader';
import { Step, StepperWrapper } from '@components/stepper';
import { BookCheck, TextSearch, Upload } from 'lucide-react';

export default function Uploader() {
  const steps: Step[] = [
    {
      icon: <Upload />,
      title: 'Upload',
      description: 'Upload your video file',
      content: <FileUploader />,
    },
    {
      icon: <TextSearch />,
      title: 'Analyze',
      description: 'Analyze your video file',
      content: <p>Analyzing your video... Please wait.</p>, // Example content
    },
    {
      icon: <BookCheck />,
      title: 'Finish',
      description: 'Finish uploading your video file',
      content: <p>Upload complete!</p>, // Example content
    },
  ];

  return <StepperWrapper steps={steps} />;
}
