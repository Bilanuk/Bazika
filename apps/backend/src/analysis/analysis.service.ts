import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly ML_SERVICE_URL =
    process.env.ML_SERVICE_URL || 'http://localhost:5001';

  constructor(private prisma: PrismaService) {}

  async analyzeVideo(videoPath: string): Promise<any> {
    this.logger.log(
      `Sending analysis request to ${this.ML_SERVICE_URL} for ${videoPath}`,
    );
    try {
      // Ensure absolute path if needed
      const absolutePath = path.resolve(videoPath);
      const response = await axios.post(`${this.ML_SERVICE_URL}/analyze`, {
        file_path: absolutePath,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`ML Service error: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async updateEpisodeEmbedding(
    episodeId: string,
    embedding: number[],
    tags: string[],
  ) {
    // Update tags normally
    await this.prisma.episode.update({
      where: { id: episodeId },
      data: { tags },
    });

    // Update vector using raw SQL
    // format: '[1.0, 2.0, ...]'
    const vectorStr = `[${embedding.join(',')}]`;

    await this.prisma.$executeRawUnsafe(
      `UPDATE "Episode" SET embedding = $1::vector WHERE id = $2`,
      vectorStr,
      episodeId,
    );
  }

  async updateSerialAggregation(serialId: string) {
    // 1. Get all episodes with embeddings
    // We need to fetch raw embeddings. Prisma Unsupported field is not selected by default.
    // We can select it using queryRaw.

    const episodes = await this.prisma.$queryRaw<
      Array<{ embedding: string; tags: string[] }>
    >`
        SELECT embedding::text, tags FROM "Episode" 
        WHERE "serialId" = ${serialId} AND embedding IS NOT NULL
      `;

    if (episodes.length === 0) return;

    // 2. Aggregate Embedding (Mean)
    // Parse strings '[1,2]' -> numbers
    const vectors = episodes.map((e) => JSON.parse(e.embedding));
    if (vectors.length === 0) return;

    const dim = vectors[0].length;
    const sumVector = new Array(dim).fill(0);

    vectors.forEach((vec) => {
      vec.forEach((val, i) => (sumVector[i] += val));
    });

    const avgVector = sumVector.map((val) => val / vectors.length);

    // 3. Aggregate Tags
    // Simple logic: Tag count / Total episodes. If > 30% -> keep.
    const tagCounts: Record<string, number> = {};
    episodes.forEach((e) => {
      if (Array.isArray(e.tags)) {
        e.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const threshold = episodes.length * 0.3;
    const finalTags = Object.entries(tagCounts)
      .filter(([_, count]) => count >= threshold)
      .map(([tag]) => tag);

    // 4. Update Serial
    await this.prisma.serial.update({
      where: { id: serialId },
      data: { tags: finalTags },
    });

    const avgVectorStr = `[${avgVector.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `UPDATE "Serial" SET embedding = $1::vector WHERE id = $2`,
      avgVectorStr,
      serialId,
    );
  }

  async getSimilarSerials(serialId: string, limit = 20) {
    // 1. Get current serial embedding
    // We can do it in one query ideally:
    // SELECT *, embedding <=> (SELECT embedding FROM "Serial" WHERE id = $1) as distance ...

    // Note: We use limit * 2 to fetch candidates for re-ranking
    const result = await this.prisma.$queryRaw`
        SELECT id, title, "coverImage", rating, tags, 
               (embedding <=> (SELECT embedding FROM "Serial" WHERE id = ${serialId})) as distance
        FROM "Serial"
        WHERE id != ${serialId} 
          AND embedding IS NOT NULL
          AND (SELECT embedding FROM "Serial" WHERE id = ${serialId}) IS NOT NULL
        ORDER BY distance ASC
        LIMIT ${limit * 2} 
      `;

    // Cast result
    const candidates = result as any[];

    // We need target tags.
    const targetSerial = await this.prisma.serial.findUnique({
      where: { id: serialId },
      select: { tags: true },
    });
    if (!targetSerial) return [];

    const targetTags = targetSerial.tags;

    const scored = candidates.map((c) => {
      const vectorDist = c.distance; // 0 to ~2
      // Convert distance to similarity (approximate)
      // Cosine Distance = 1 - Cosine Similarity
      // So Similarity = 1 - Distance
      // But distance can be > 1 if vectors are not normalized? CLIP vectors are usually normalized?
      // pgvector <=> operator returns 1 - cosine_similarity. Range [0, 2].
      // 0 = identical, 1 = orthogonal, 2 = opposite.
      const vectorSim = Math.max(0, 1 - vectorDist);

      const tagSim = this.jaccardSimilarity(targetTags, c.tags || []);

      // Hybrid Score: 70% Visual, 30% Tags
      const score = vectorSim * 0.7 + tagSim * 0.3;

      return {
        ...c,
        score,
        matchPercentage: Math.round(score * 100),
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private jaccardSimilarity(tagsA: string[], tagsB: string[]): number {
    const setA = new Set(tagsA);
    const setB = new Set(tagsB);
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }
}
