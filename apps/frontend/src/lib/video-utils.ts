/**
 * Constructs the correct video URL based on environment
 * 
 * The database stores relative paths like "episodeId/playlist.m3u8"
 * This function converts them to the correct full URL:
 * 
 * Development: http://localhost:9000/anime/episodeId/playlist.m3u8 (direct MinIO)
 * Production: /storage/anime/episodeId/playlist.m3u8 (through nginx proxy)
 * 
 * @param relativePath - The relative path from the database (e.g., "episodeId/playlist.m3u8")
 * @returns The full URL to access the video
 */
export function getVideoUrl(relativePath: string): string {
  if (!relativePath) return '';

  // Remove leading slash if present
  const cleanPath = relativePath.startsWith('/')
    ? relativePath.slice(1)
    : relativePath; 

  // In development, use direct MinIO access
  if (process.env.NODE_ENV === 'development') {
    const minioHost = process.env.NEXT_PUBLIC_MINIO_HOST || 'localhost';
    const minioPort = process.env.NEXT_PUBLIC_MINIO_PORT || '9000';
    const url = `http://${minioHost}:${minioPort}/anime/${cleanPath}`;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Video URL (dev):', url);
    }
    
    return url;
  }

  // In production, use nginx proxy
  const url = `/storage/anime/${cleanPath}`;
  return url;
}
