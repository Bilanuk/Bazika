import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

// --- Configuration ---
// Baseline for Vector Similarity (0.0 to 1.0). 
// For anime style (CLIP), matches are often > 0.8. 
// Setting this to 0.8 means anything below 80% similarity gets a 0 score, 
// and the range [0.8, 1.0] is stretched to [0.0, 1.0] for better differentiation.
const VECTOR_SIM_BASELINE = 0.2;

// Weights for Hybrid Score (Sum should ideally be 1.0, but not strictly required)
const WEIGHT_VECTOR = 0.6;
const WEIGHT_TAGS = 0.4;
// ---------------------

interface SerialCandidate {
  id: string;
  title: string;
  coverImage: string | null;
  rating: number;
  tags: string[];
  distance: number;
}

export interface SimilarSerial {
  id: string;
  title: string;
  coverImage: string | null;
  rating: number;
  score: number;
  matchPercentage: number;
}

function jaccardSimilarity(tagsA: string[], tagsB: string[]): number {
  const setA = new Set(tagsA);
  const setB = new Set(tagsB);

  let intersectionSize = 0;
  setA.forEach((tag) => {
    if (setB.has(tag)) {
      intersectionSize++;
    }
  });

  const unionSize = new Set(tagsA.concat(tagsB)).size;

  if (unionSize === 0) return 0;
  return intersectionSize / unionSize;
}

async function fetchSimilarSerials(
  serialId: string,
  limit = 30
): Promise<SimilarSerial[]> {
  try {
    // 1. Get current serial embedding & tags
    // We need raw SQL for vector distance
    // Note: Prisma $queryRaw maps SQL types to JS types. Postgres arrays usually map to JS arrays.
    const result = await prisma.$queryRaw`
        SELECT id, title, "coverImage", rating, tags, 
               (embedding <=> (SELECT embedding FROM "Serial" WHERE id = ${serialId})) as distance
        FROM "Serial"
        WHERE id != ${serialId} 
          AND embedding IS NOT NULL
          AND (SELECT embedding FROM "Serial" WHERE id = ${serialId}) IS NOT NULL
        ORDER BY distance ASC
        LIMIT ${limit * 2} 
      `;

    const candidates = result as SerialCandidate[];

    if (!candidates || candidates.length === 0) {
      return [];
    }

    const targetSerial = await prisma.serial.findUnique({
      where: { id: serialId },
      select: { tags: true },
    });

    if (!targetSerial) return [];

    const targetTags = targetSerial.tags || [];

    const scored = candidates.map((c) => {
      const vectorDist = c.distance;
      // pgvector <=> operator returns 1 - cosine_similarity. Range [0, 2].
      const rawVectorSim = Math.max(0, 1 - vectorDist);
      
      // Normalize: Map [BASELINE, 1] to [0, 1]
      // This spreads out the scores so "almost similar" (0.85) is low and "very similar" (0.95) is high.
      let vectorSim = 0;
      if (rawVectorSim > VECTOR_SIM_BASELINE) {
        vectorSim = (rawVectorSim - VECTOR_SIM_BASELINE) / (1 - VECTOR_SIM_BASELINE);
      }

      const tagSim = jaccardSimilarity(targetTags, c.tags || []);

      // Hybrid Score
      const score = vectorSim * WEIGHT_VECTOR + tagSim * WEIGHT_TAGS;

      return {
        id: c.id,
        title: c.title,
        coverImage: c.coverImage,
        rating: c.rating,
        score,
        matchPercentage: Math.round(score * 100),
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error('Error fetching similar serials:', error);
    return [];
  }
}

export const getSimilarSerials = unstable_cache(
  fetchSimilarSerials,
  ['similar-serials-logic'],
  { revalidate: 10, tags: ['similar-serials'] }
);
