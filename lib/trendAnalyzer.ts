/**
 * Gemini Trend Analyzer with Google Search Grounding
 * Uses Gemini 3 Pro to analyze news and extract mobility insights
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TrendSignal {
    id: string;
    type: 'positive' | 'negative' | 'neutral';
    category: 'visa' | 'economic' | 'political' | 'security' | 'social';
    title: string;
    summary: string;
    impactScore: number; // -100 to +100
    affectedCountries: string[];
    source: string;
    confidence: number; // 0-1
    timestamp: Date;
}

export interface TrendAnalysis {
    signals: TrendSignal[];
    overallSentiment: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    thoughtSignature: string;
    analyzedAt: Date;
}

export class TrendAnalyzer {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (key) {
            this.genAI = new GoogleGenerativeAI(key);
            // Use Gemini 3 Pro with search grounding capability
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-3-pro-preview',
                tools: [
                    {
                        // @ts-ignore - Updated Google Search tool key
                        googleSearch: {},
                    },
                ] as any,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                }
            });
        } else {
            console.warn('TrendAnalyzer: No Gemini API key. Using mock analysis.');
        }
    }

    /**
     * Analyze news articles and extract trend signals
     */
    async analyzeNews(
        articles: { title: string; description: string; source: string }[],
        migrationContext: { origin: string; destination: string }
    ): Promise<TrendAnalysis> {
        if (!this.model) {
            return this._getMockAnalysis(migrationContext);
        }

        try {
            const prompt = `
You are a geopolitical mobility analyst. Analyze these news headlines for their impact on migration from ${migrationContext.origin} to ${migrationContext.destination}.

NEWS ARTICLES:
${articles.map((a, i) => `${i + 1}. [${a.source}] ${a.title}\n   ${a.description}`).join('\n\n')}

TASK: Extract trend signals and assess migration impact.

OUTPUT FORMAT (JSON):
{
    "signals": [
        {
            "id": "signal_1",
            "type": "positive|negative|neutral",
            "category": "visa|economic|political|security|social",
            "title": "Brief signal title",
            "summary": "One sentence explanation",
            "impactScore": -100 to +100,
            "affectedCountries": ["country1", "country2"],
            "confidence": 0.0 to 1.0
        }
    ],
    "overallSentiment": "bullish|bearish|neutral",
    "riskLevel": "low|medium|high|critical",
    "reasoning": "Your thought process explaining the analysis"
}

Focus on factors affecting:
- Visa policies and processing times
- Economic stability and job markets
- Political climate and bilateral relations
- Safety and security concerns
- Quality of life changes
`;

            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
            const json = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text);

            return {
                signals: json.signals.map((s: any, i: number) => ({
                    ...s,
                    id: s.id || `signal_${i}`,
                    timestamp: new Date(),
                    source: articles[0]?.source || 'Analysis'
                })),
                overallSentiment: json.overallSentiment || 'neutral',
                riskLevel: json.riskLevel || 'medium',
                thoughtSignature: json.reasoning || 'Analysis completed.',
                analyzedAt: new Date()
            };

        } catch (error) {
            console.error('Trend analysis failed:', error);
            return this._getMockAnalysis(migrationContext);
        }
    }

    /**
     * Use Google Search Grounding to get real-time insights
     * This leverages Gemini's ability to search the web
     */
    async searchGroundedAnalysis(
        query: string,
        migrationContext: { origin: string; destination: string }
    ): Promise<TrendAnalysis> {
        if (!this.model) {
            return this._getMockAnalysis(migrationContext);
        }

        try {
            const prompt = `
You are a real-time geopolitical analyst. Search for and analyze the latest information about:

QUERY: ${query}
MIGRATION PATH: ${migrationContext.origin} → ${migrationContext.destination}

Using your knowledge and any available information, provide:
1. Current visa/immigration policy status
2. Recent changes or announcements
3. Economic conditions affecting migrants
4. Political stability assessment
5. Any warnings or opportunities

OUTPUT FORMAT (JSON):
{
    "signals": [
        {
            "type": "positive|negative|neutral",
            "category": "visa|economic|political|security|social",
            "title": "Signal title",
            "summary": "Explanation",
            "impactScore": -100 to +100,
            "affectedCountries": ["countries"],
            "confidence": 0.0 to 1.0
        }
    ],
    "overallSentiment": "bullish|bearish|neutral",
    "riskLevel": "low|medium|high|critical",
    "reasoning": "Your analysis reasoning",
    "sources": ["source1", "source2"]
}
`;

            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
            const json = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text);

            return {
                signals: json.signals.map((s: any, i: number) => ({
                    ...s,
                    id: `grounded_${i}`,
                    timestamp: new Date(),
                    source: 'Google Search Grounding'
                })),
                overallSentiment: json.overallSentiment || 'neutral',
                riskLevel: json.riskLevel || 'medium',
                thoughtSignature: `[Search Grounded]: ${json.reasoning}`,
                analyzedAt: new Date()
            };

        } catch (error) {
            console.error('Grounded analysis failed:', error);
            return this._getMockAnalysis(migrationContext);
        }
    }

    private _getMockAnalysis(context: { origin: string; destination: string }): TrendAnalysis {
        return {
            signals: [
                {
                    id: 'mock_1',
                    type: 'positive',
                    category: 'visa',
                    title: 'Streamlined Visa Processing',
                    summary: `${context.destination} has reduced visa processing times by 30%`,
                    impactScore: 45,
                    affectedCountries: [context.destination],
                    source: 'Mock Analysis',
                    confidence: 0.85,
                    timestamp: new Date()
                },
                {
                    id: 'mock_2',
                    type: 'neutral',
                    category: 'economic',
                    title: 'Stable Economic Outlook',
                    summary: 'No major economic changes expected in the near term',
                    impactScore: 0,
                    affectedCountries: [context.origin, context.destination],
                    source: 'Mock Analysis',
                    confidence: 0.7,
                    timestamp: new Date()
                }
            ],
            overallSentiment: 'bullish',
            riskLevel: 'low',
            thoughtSignature: '[MOCK] Analyzed migration corridor. Favorable conditions detected.',
            analyzedAt: new Date()
        };
    }
}

// Singleton instance
export const trendAnalyzer = new TrendAnalyzer();
