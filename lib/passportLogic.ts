
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TrendSignal } from './trendAnalyzer';

// Types for the Passport Logic Service
export interface GeopoliticalRiskProfile {
    reputationScore: number; // 0-100
    visaFreeCount: number;
    riskFactors: string[];
    projectedTrends: {
        year: number;
        trend: 'improving' | 'stable' | 'declining';
        reasoning: string;
    }[];
    thoughtSignature: string; // The reasoning trace
    trendAdjustedScore?: number; // Score after applying trend signals
    appliedTrends?: string[]; // List of trend titles that affected the score
}

export class PassportLogicService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            // Using gemini-3-pro-preview
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-3-pro-preview',
                generationConfig: {
                    temperature: 0.7,
                }
            });
        } else {
            console.warn("PassportLogicService initialized without API Key");
        }
    }

    async analyzePassport(passportId: string, currentContext: any): Promise<GeopoliticalRiskProfile> {
        if (!this.model) {
            return this._mockAnalysis(passportId);
        }

        try {
            const prompt = `
         Analyze the geopolitical risk profile for a passport holder from: ${passportId}.
         Context: ${JSON.stringify(currentContext)}

         Output a JSON object with:
         - reputationScore (0-100)
         - visaFreeCount (absolute number estimate)
         - riskFactors (array of strings, specific political/economic risks)
         - projectedTrends (array of objects with year, trend, reasoning)
         
         CRITICAL: Provide deep reasoning on *why* the score is what it is, considering valid 2026 geopolitical trends.
       `;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Extract Thought Signature
            let thoughtSignature = "Reasoning trace captured.";
            if (response.candidates && response.candidates[0]?.content?.parts) {
                const parts = response.candidates[0].content.parts;
                const thoughtPart = parts.find((p: any) => p.text && p.text.startsWith("Thought:"));
                if (thoughtPart) {
                    thoughtSignature = thoughtPart.text.substring(0, 500) + "...";
                }
            }

            const json = this._extractJSON(text);

            return {
                ...json,
                thoughtSignature
            };

        } catch (error) {
            console.error("PassportLogic Analysis Failed:", error);
            return this._mockAnalysis(passportId);
        }
    }

    /**
     * Apply trend signals to adjust the reputation score
     */
    applyTrendSignals(
        profile: GeopoliticalRiskProfile,
        trendSignals: TrendSignal[]
    ): GeopoliticalRiskProfile {
        if (!trendSignals || trendSignals.length === 0) {
            return { ...profile, trendAdjustedScore: profile.reputationScore };
        }

        let adjustment = 0;
        const appliedTrends: string[] = [];

        for (const signal of trendSignals) {
            // Weight by confidence
            const impact = (signal.impactScore / 100) * signal.confidence * 10;
            adjustment += impact;

            if (Math.abs(impact) > 1) {
                appliedTrends.push(`${signal.title} (${signal.impactScore > 0 ? '+' : ''}${Math.round(impact)})`);
            }
        }

        // Calculate adjusted score, clamped to 0-100
        const trendAdjustedScore = Math.max(0, Math.min(100,
            Math.round(profile.reputationScore + adjustment)
        ));

        // Add trend-derived risk factors
        const newRiskFactors = [...profile.riskFactors];
        for (const signal of trendSignals) {
            if (signal.type === 'negative' && signal.confidence > 0.7) {
                newRiskFactors.push(`[LIVE] ${signal.summary}`);
            }
        }

        return {
            ...profile,
            trendAdjustedScore,
            appliedTrends,
            riskFactors: newRiskFactors,
            thoughtSignature: profile.thoughtSignature +
                `\n\n[Trend Adjustment]: Applied ${trendSignals.length} signals. Score adjusted by ${adjustment > 0 ? '+' : ''}${Math.round(adjustment)}.`
        };
    }

    private _extractJSON(text: string): any {
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        try {
            return JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text);
        } catch {
            return { reputationScore: 50, visaFreeCount: 0, riskFactors: ["Parse Error"], projectedTrends: [] };
        }
    }

    private _mockAnalysis(_passportId: string): GeopoliticalRiskProfile {
        // Mock data for development
        return {
            reputationScore: 78,
            visaFreeCount: 172,
            riskFactors: ["Regional instability in neighboring bloc", "Currency fluctuation dependence"],
            projectedTrends: [
                { year: 2027, trend: 'stable', reasoning: "Trade agreements likely to hold." }
            ],
            thoughtSignature: "[MOCK] Analyzed historical visa waivers and current diplomatic tensions. Identified moderate risk due to recent election outcomes..."
        };
    }
}

export const passportLogic = new PassportLogicService(process.env.GEMINI_API_KEY);

