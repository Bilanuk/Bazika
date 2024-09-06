'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, CheckCircle } from 'lucide-react';

interface FileWithPreview extends File {
  preview: string | null;
}

export function FileUploader() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mkv', '.avi'],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 1024,
  });

  const removeFile = (file: FileWithPreview) => {
    const newFiles = [...files];
    newFiles.splice(newFiles.indexOf(file), 1);
    setFiles(newFiles);
  };

  return (
    <div className='mx-auto max-w-md p-6'>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className='mx-auto h-12 w-12 text-gray-400' />
        <p className='mt-2 text-sm text-gray-600'>
          Drag 'n' drop some files here, or click to select files
        </p>
        <p className='mt-1 text-xs text-gray-500'>
          (Only *.mp4, *.mkv, *.avi files are allowed)
        </p>
      </div>

      {files.length > 0 && (
        <ul className='mt-6 divide-y divide-gray-200'>
          {files.map((file) => (
            <li
              key={file.name}
              className='flex items-center justify-between py-3'
            >
              <div className='flex items-center'>
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className='h-10 w-10 rounded object-cover'
                  />
                ) : (
                  <File className='h-10 w-10 text-gray-400' />
                )}
                <div className='ml-4'>
                  <p className='text-sm font-medium'>{file.name}</p>
                  <p className='text-xs text-gray-500'>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file)}
                className='ml-4 text-sm font-medium text-red-500 hover:text-red-700'
              >
                <X className='h-5 w-5' />
                <span className='sr-only'>Remove file</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className='mt-6'>
          <button
            type='button'
            className='flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          >
            <CheckCircle className='mr-2 h-5 w-5' />
            Upload {files.length} file{files.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
