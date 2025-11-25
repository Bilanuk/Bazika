import { Resolver, Query, Args } from '@nestjs/graphql';
import { AnalysisService } from './analysis.service';
import { Recommendation } from './models/recommendation.model';

@Resolver()
export class AnalysisResolver {
  constructor(private readonly analysisService: AnalysisService) {}

  @Query(() => [Recommendation], { name: 'getRecommendations' })
  async getRecommendations(@Args('episodeId') episodeId: string) {
    const results = await this.analysisService.getRecommendations(episodeId);
    
    // Transform to GraphQL model
    return results.map(r => ({
        episode: r.episode,
        score: r.score
    }));
  }
}



