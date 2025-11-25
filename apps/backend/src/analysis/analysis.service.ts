import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(private prisma: PrismaService) {}

  async getRecommendations(episodeId: string, limit = 10) {
    // 1. Get target analysis
    const target = await this.prisma.videoAnalysis.findUnique({
      where: { episodeId },
      include: { episode: { include: { serial: true } } },
    });

    if (
      !target ||
      !target.visualEmbedding ||
      target.visualEmbedding.length === 0
    ) {
      return [];
    }

    // 2. Get all other analyses
    // Optimization: In real app, use pgvector or approximate search
    const candidates = await this.prisma.videoAnalysis.findMany({
      where: {
        episodeId: { not: episodeId },
        status: 'COMPLETED',
      },
      include: { episode: { include: { serial: true } } },
    });

    // 3. Calculate scores
    const scored = candidates.map((candidate) => {
      const visualSim = this.cosineSimilarity(
        target.visualEmbedding,
        candidate.visualEmbedding,
      );
      const tagSim = this.jaccardSimilarity(target.tags, candidate.tags);

      // Hybrid Score: 70% Visual, 30% Tags
      const hybridScore = visualSim * 0.7 + tagSim * 0.3;

      return {
        ...candidate,
        score: hybridScore,
        metrics: { visualSim, tagSim },
      };
    });

    // 4. Sort and return
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
  }

  private jaccardSimilarity(tagsA: string[], tagsB: string[]): number {
    const setA = new Set(tagsA);
    const setB = new Set(tagsB);
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  async analyzeVideo(videoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Assuming apps/backend is the CWD, we need to go up to root
      // But actually, when running in dist, it might be different.
      // Better to use relative path from project root if we know where we are running.
      // In development, we are likely in project root.
      // Let's assume we can reach apps/ml-service/main.py

      const scriptPath = path.resolve(process.cwd(), 'apps/ml-service/main.py');
      this.logger.log(`Running analysis script: ${scriptPath} on ${videoPath}`);

      const pythonProcess = spawn('python3', [scriptPath, videoPath]);

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Analysis script failed with code ${code}`);
          this.logger.error(`Stderr: ${stderrData}`);
          reject(new Error(`Analysis script failed: ${stderrData}`));
          return;
        }

        try {
          // Find the last line that looks like JSON
          const lines = stdoutData.trim().split('\n');
          const jsonLine = lines[lines.length - 1];
          const result = JSON.parse(jsonLine);

          if (!result.success) {
            reject(new Error(result.error || 'Unknown analysis error'));
            return;
          }

          resolve(result);
        } catch (e) {
          this.logger.error('Failed to parse analysis result', e);
          this.logger.error(`Stdout: ${stdoutData}`);
          reject(new Error('Failed to parse analysis result'));
        }
      });
    });
  }
}
