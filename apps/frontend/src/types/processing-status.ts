export enum ProcessingStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED', 
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export const ProcessingStatusLabels: Record<ProcessingStatus, string> = {
  [ProcessingStatus.PENDING]: 'Pending',
  [ProcessingStatus.QUEUED]: 'Queued',
  [ProcessingStatus.PROCESSING]: 'Processing',
  [ProcessingStatus.COMPLETED]: 'Completed',
  [ProcessingStatus.FAILED]: 'Failed',
  [ProcessingStatus.SKIPPED]: 'Skipped'
};

export const ProcessingStatusColors: Record<ProcessingStatus, string> = {
  [ProcessingStatus.PENDING]: 'bg-gray-100 text-gray-800',
  [ProcessingStatus.QUEUED]: 'bg-blue-100 text-blue-800',
  [ProcessingStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
  [ProcessingStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [ProcessingStatus.FAILED]: 'bg-red-100 text-red-800',
  [ProcessingStatus.SKIPPED]: 'bg-yellow-100 text-yellow-800'
}; 