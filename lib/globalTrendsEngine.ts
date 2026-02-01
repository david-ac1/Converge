/**
 * Global Trends Engine
 * Orchestrates News API + Gemini Analysis for continuous trend monitoring
 */

import { newsApi, NewsApiService } from './newsApi';
import { trendAnalyzer, TrendAnalysis, TrendSignal } from './trendAnalyzer';

export interface GlobalTrendsReport {
    migrationPath: {
        origin: string;
        destination: string;
    };
    newsAnalysis: TrendAnalysis;
    searchGroundedInsights: TrendAnalysis;
    combinedSignals: TrendSignal[];
    riskScore: number; // 0-100
    opportunityScore: number; // 0-100
    recommendation: string;
    generatedAt: Date;
}

export class GlobalTrendsEngine {
    private newsService: NewsApiService;

    constructor() {
        this.newsService = newsApi;
    }

    /**
     * Generate a comprehensive trends report for a migration path
     */
    async generateReport(
        origin: string,
        destination: string,
        includeSearchGrounding: boolean = true
    ): Promise<GlobalTrendsReport> {
        console.log(`GlobalTrendsEngine: Generating report for ${origin} → ${destination}`);

        const migrationContext = { origin, destination };

        // Step 1: Fetch news
        const news = await this.newsService.getRelevantNews(origin, destination);
        console.log(`Fetched ${news.articles.length} news articles`);

        // Step 2: Analyze news with Gemini
        const newsAnalysis = await trendAnalyzer.analyzeNews(
            news.articles.map(a => ({
                title: a.title,
                description: a.description || '',
                source: a.source
            })),
            migrationContext
        );

        // Step 3: Get search-grounded insights (real-time web data)
        let searchGroundedInsights: TrendAnalysis;
        if (includeSearchGrounding) {
            searchGroundedInsights = await trendAnalyzer.searchGroundedAnalysis(
                `${destination} immigration visa policy 2026 changes for ${origin} citizens`,
                migrationContext
            );
        } else {
            searchGroundedInsights = {
                signals: [],
                overallSentiment: 'neutral',
                riskLevel: 'medium',
                thoughtSignature: 'Search grounding disabled',
                analyzedAt: new Date()
            };
        }

        // Step 4: Combine and deduplicate signals
        const combinedSignals = this._combineSignals(
            newsAnalysis.signals,
            searchGroundedInsights.signals
        );

        // Step 5: Calculate scores
        const { riskScore, opportunityScore } = this._calculateScores(combinedSignals);

        // Step 6: Generate recommendation
        const recommendation = this._generateRecommendation(
            riskScore,
            opportunityScore
        );

        return {
            migrationPath: migrationContext,
            newsAnalysis,
            searchGroundedInsights,
            combinedSignals,
            riskScore,
            opportunityScore,
            recommendation,
            generatedAt: new Date()
        };
    }

    private _combineSignals(
        newsSignals: TrendSignal[],
        groundedSignals: TrendSignal[]
    ): TrendSignal[] {
        // Merge and sort by impact
        const all = [...newsSignals, ...groundedSignals];
        return all.sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore));
    }

    private _calculateScores(signals: TrendSignal[]): { riskScore: number; opportunityScore: number } {
        if (signals.length === 0) {
            return { riskScore: 50, opportunityScore: 50 };
        }

        let totalRisk = 0;
        let totalOpportunity = 0;
        let weightSum = 0;

        for (const signal of signals) {
            const weight = signal.confidence;
            weightSum += weight;

            if (signal.impactScore < 0) {
                totalRisk += Math.abs(signal.impactScore) * weight;
            } else {
                totalOpportunity += signal.impactScore * weight;
            }
        }

        // Normalize to 0-100
        const riskScore = Math.min(100, Math.round((totalRisk / weightSum) * 1.5));
        const opportunityScore = Math.min(100, Math.round((totalOpportunity / weightSum) * 1.5));

        return { riskScore, opportunityScore };
    }

    private _generateRecommendation(
        riskScore: number,
        opportunityScore: number
    ): string {
        const netScore = opportunityScore - riskScore;

        if (netScore > 30) {
            return 'FAVORABLE: Current conditions are highly supportive of migration. Consider accelerating your timeline.';
        } else if (netScore > 0) {
            return 'POSITIVE: Conditions are generally favorable with some minor risks to monitor.';
        } else if (netScore > -20) {
            return 'CAUTIOUS: Mixed signals detected. Proceed with detailed contingency planning.';
        } else {
            return 'ELEVATED RISK: Significant challenges identified. Consider alternative destinations or delay.';
        }
    }
}

// Singleton
export const globalTrendsEngine = new GlobalTrendsEngine();
