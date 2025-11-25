/**
 * Extracts video quality from content item title
 * Looks for patterns like 480p, 720p, 1080p, 2160p (4K)
 * @param title - The content item title
 * @returns Quality string (e.g., "1080p") or null if not found
 */
export function extractQualityFromTitle(title: string): string | null {
  if (!title) return null;

  // Match 3-4 digit number followed by 'p' (case insensitive)
  // Examples: 480p, 720p, 1080p, 2160p
  const match = title.match(/(\d{3,4})p/i);

  if (match) {
    // Normalize to lowercase (e.g., "1080P" -> "1080p")
    return match[1] + 'p';
  }

  return null;
}



