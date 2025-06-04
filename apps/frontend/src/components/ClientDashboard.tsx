'use client';

import React, { useState } from 'react';
import { useSources } from '@/hooks/useSources';
import { useContentItems } from '@/hooks/useContentItems';

export default function ClientDashboard() {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  
  const { sources, loading: sourcesLoading, error: sourcesError } = useSources();
  const { 
    contentItems, 
    loading: contentItemsLoading, 
    error: contentItemsError 
  } = useContentItems({ 
    limit: 50,
    sourceId: selectedSourceId || undefined 
  });

  if (sourcesLoading || contentItemsLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
          <p className='mt-2 text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (sourcesError || contentItemsError) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600'>
            Error: {sourcesError || contentItemsError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mx-auto max-w-7xl'>
        <h1 className='mb-8 text-3xl font-bold text-gray-900'>
          Content Dashboard
        </h1>

        {/* Sources Section */}
        <div className='mb-8 rounded-lg bg-white p-6 shadow'>
          <h2 className='mb-4 text-xl font-semibold'>
            Sources ({sources.length})
          </h2>
          
          <div className='mb-4'>
            <select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className='rounded border border-gray-300 px-3 py-2'
            >
              <option value=''>All Sources</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          {sources.length === 0 ? (
            <p className='py-8 text-center text-gray-500'>No sources found</p>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {sources.map((source) => (
                <div
                  key={source.id}
                  className='rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300'
                >
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='font-medium text-gray-900'>{source.name}</h3>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        source.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {source.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className='mb-2 text-sm text-gray-600'>{source.type}</p>
                  <p className='truncate text-xs text-gray-500'>{source.url}</p>
                  {source.lastChecked && (
                    <p className='mt-2 text-xs text-gray-400'>
                      Last checked:{' '}
                      {new Date(source.lastChecked).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Items Section */}
        <div className='rounded-lg bg-white p-6 shadow'>
          <h2 className='mb-4 text-xl font-semibold'>
            Content Items ({contentItems.length})
            {selectedSourceId && (
              <span className='ml-2 text-sm font-normal text-gray-600'>
                from {sources.find((s) => s.id === selectedSourceId)?.name}
              </span>
            )}
          </h2>

          {contentItems.length === 0 ? (
            <p className='py-8 text-center text-gray-500'>
              No content items found
            </p>
          ) : (
            <div className='space-y-3'>
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  className='rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300'
                >
                  <div className='mb-2 flex items-start justify-between'>
                    <h3 className='mr-4 flex-1 font-medium text-gray-900'>
                      <a
                        href={item.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='transition-colors hover:text-blue-600'
                      >
                        {item.title}
                      </a>
                    </h3>
                    <div className='flex gap-2'>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          item.notificationSent
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.notificationSent ? 'Notified' : 'Pending'}
                      </span>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          item.processingStatus === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : item.processingStatus === 'PROCESSING'
                            ? 'bg-purple-100 text-purple-800'
                            : item.processingStatus === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.processingStatus}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className='mb-2 line-clamp-2 text-sm text-gray-600'>
                      {item.description}
                    </p>
                  )}

                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>
                      Published: {new Date(item.publishedAt).toLocaleString()}
                    </span>
                    {item.source && (
                      <span className='rounded bg-gray-100 px-2 py-1'>
                        {item.source.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
