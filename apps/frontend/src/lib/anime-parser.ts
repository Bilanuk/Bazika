export interface ParsedAnimeTitle {
  releaseGroup?: string;
  seriesName: string;
  episodeNumber?: number;
  quality?: string;
  season?: number;
  originalTitle: string;
}

export function parseAnimeTitle(title: string): ParsedAnimeTitle | null {
  try {
    // Remove file extension
    const cleanTitle = title.replace(/\.(mkv|mp4|avi)$/i, '');

    // Extract release group [GroupName]
    const releaseGroupMatch = cleanTitle.match(/^\[([^\]]+)\]/);
    const releaseGroup = releaseGroupMatch?.[1];

    // Remove release group from title for further parsing
    let remainingTitle = cleanTitle;
    if (releaseGroupMatch) {
      remainingTitle = cleanTitle.replace(releaseGroupMatch[0], '').trim();
    }

    // Extract quality (1080p, 720p, etc.) - handle both parentheses and brackets
    const qualityMatch = remainingTitle.match(/[\[\(](\d+p)[\]\)]|(\d+p)/i);
    const quality = qualityMatch?.[1] || qualityMatch?.[2];

    // Remove quality, codec info, and hash from title - more comprehensive cleanup
    remainingTitle = remainingTitle
      .replace(/\[\d+p[^\]]*\]/gi, '') // Remove [1080p CR WEB-DL AVC AAC]
      .replace(/\([^\)]*\d+p[^\)]*\)/gi, '') // Remove (1080p) style
      .replace(/\[[A-F0-9]{8}\]/gi, '') // Remove CRC hash [ADB20474]
      .replace(/\[MultiSub\]/gi, '') // Remove [MultiSub]
      .replace(/\[.*?Sub.*?\]/gi, '') // Remove any subtitle info
      .replace(/\[.*?DL.*?\]/gi, '') // Remove download info
      .replace(/\[.*?Rip.*?\]/gi, '') // Remove [WEBRip] etc
      .trim();

    // Extract episode number - look for patterns like "- 10", "Episode 10", "Ep 10"
    const episodePatterns = [
      /\s-\s(\d+)(?:\s|\[|$)/, // " - 10" (Standard)
      /- (\d+)(?:\s|$)/, // "- 10"
      /Episode (\d+)/i, // "Episode 10"
      /Ep\.? (\d+)/i, // "Ep 10" or "Ep. 10"
      /E(\d+)(?:\s|$)/i, // "E10"
    ];

    let episodeNumber: number | undefined;
    let episodeMatch: RegExpMatchArray | null = null;

    for (const pattern of episodePatterns) {
      episodeMatch = remainingTitle.match(pattern);
      if (episodeMatch) {
        episodeNumber = parseInt(episodeMatch[1], 10);
        break;
      }
    }

    // Extract series name (everything before episode number)
    let seriesName = remainingTitle;
    if (episodeMatch) {
      seriesName = remainingTitle.replace(episodeMatch[0], '').trim();
    }

    // Extract season number from series name
    const seasonMatch = seriesName.match(/S(\d+)/i);
    const season = seasonMatch ? parseInt(seasonMatch[1], 10) : undefined;

    // Clean up series name
    seriesName = seriesName
      .replace(/S\d+/i, '') // Remove season indicator
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!seriesName) {
      console.warn(`Could not extract series name from: ${title}`);
      return null;
    }

    const result: ParsedAnimeTitle = {
      releaseGroup,
      seriesName,
      episodeNumber,
      quality,
      season,
      originalTitle: title,
    };

    return result;
  } catch (error) {
    console.error(`Failed to parse title "${title}":`, error);
    return null;
  }
}

export function normalizeSeriesName(seriesName: string): string {
  return seriesName
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

