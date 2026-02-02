/**
 * Convergence Engine
 * Calculates migration pressure and generates predictions for destination countries
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Top 15 priority destinations with stronger visual emphasis
export const TOP_15_DESTINATIONS = [
    'ca', 'us', 'gb', 'de', 'au', 'fr', 'es', 'pt', 'nl', 'ch', 'ae', 'sg', 'nz', 'ie', 'se'
];

// Country names mapping
export const COUNTRY_NAMES: Record<string, string> = {
    'ca': 'Canada', 'us': 'United States', 'gb': 'United Kingdom', 'de': 'Germany',
    'au': 'Australia', 'fr': 'France', 'es': 'Spain', 'pt': 'Portugal',
    'nl': 'Netherlands', 'ch': 'Switzerland', 'ae': 'UAE', 'sg': 'Singapore',
    'nz': 'New Zealand', 'ie': 'Ireland', 'se': 'Sweden', 'jp': 'Japan',
    'kr': 'South Korea', 'it': 'Italy', 'be': 'Belgium', 'at': 'Austria',
    'no': 'Norway', 'dk': 'Denmark', 'fi': 'Finland', 'cl': 'Chile',
    'uy': 'Uruguay', 'mx': 'Mexico', 'br': 'Brazil', 'ar': 'Argentina',
    'ng': 'Nigeria', 'in': 'India', 'cn': 'China', 'pk': 'Pakistan',
    'bd': 'Bangladesh', 'ph': 'Philippines', 'eg': 'Egypt', 'za': 'South Africa',
    'ke': 'Kenya', 'gh': 'Ghana', 'ir': 'Iran', 'tr': 'Turkey',
    'ru': 'Russia', 'ua': 'Ukraine', 'pl': 'Poland', 'cz': 'Czechia',
    'hu': 'Hungary', 'ro': 'Romania', 'gr': 'Greece', 'my': 'Malaysia',
    'th': 'Thailand', 'id': 'Indonesia', 'vn': 'Vietnam'
};

// Common origin countries for quick selection
export const COMMON_ORIGINS = ['ng', 'in', 'cn', 'br', 'ir', 'pk', 'ph', 'eg', 'gh', 'ke'];

export interface ConvergencePrediction {
    type: 'warning' | 'opportunity' | 'neutral';
    title: string;
    summary: string;
    confidence: number;
    timeframe: string;
}

export interface CountryConvergence {
    country: string;
    countryCode: string;
    pressureScore: number;          // 0-100 general pressure
    pressureFromOrigin: number;     // 0-100 pressure from selected origin
    isTop15: boolean;
    trend: 'increasing' | 'stable' | 'decreasing';
    topOrigins: string[];
    pathwayCongestion: {
        student: number;
        skilled: number;
        investment: number;
        family: number;
    };
    predictions: ConvergencePrediction[];
    opportunityScore: number;       // Inverse of pressure
}

export interface ConvergenceReport {
    originCountry: string;
    convergenceData: CountryConvergence[];
    globalSignals: ConvergencePrediction[];
    generatedAt: string;
    _thoughtSignature?: string;
}

// Mock pressure data for demo mode
const MOCK_PRESSURE_DATA: Record<string, Partial<CountryConvergence>> = {
    'ca': { pressureScore: 87, trend: 'increasing', topOrigins: ['India', 'Nigeria', 'Iran', 'China'] },
    'de': { pressureScore: 72, trend: 'increasing', topOrigins: ['Turkey', 'India', 'Syria', 'Afghanistan'] },
    'gb': { pressureScore: 78, trend: 'stable', topOrigins: ['India', 'Nigeria', 'Pakistan', 'China'] },
    'us': { pressureScore: 65, trend: 'stable', topOrigins: ['Mexico', 'India', 'China', 'Philippines'] },
    'au': { pressureScore: 70, trend: 'increasing', topOrigins: ['China', 'India', 'UK', 'Philippines'] },
    'pt': { pressureScore: 55, trend: 'decreasing', topOrigins: ['Brazil', 'UK', 'China', 'USA'] },
    'es': { pressureScore: 58, trend: 'stable', topOrigins: ['Colombia', 'Venezuela', 'Morocco', 'UK'] },
    'nl': { pressureScore: 62, trend: 'stable', topOrigins: ['India', 'Turkey', 'Poland', 'UK'] },
    'sg': { pressureScore: 68, trend: 'increasing', topOrigins: ['India', 'China', 'Malaysia', 'Indonesia'] },
    'ae': { pressureScore: 45, trend: 'stable', topOrigins: ['India', 'Pakistan', 'Philippines', 'UK'] },
    'nz': { pressureScore: 52, trend: 'stable', topOrigins: ['UK', 'China', 'India', 'South Africa'] },
    'ie': { pressureScore: 60, trend: 'increasing', topOrigins: ['Brazil', 'India', 'Nigeria', 'UK'] },
    'ch': { pressureScore: 50, trend: 'stable', topOrigins: ['Germany', 'Italy', 'France', 'UK'] },
    'se': { pressureScore: 48, trend: 'decreasing', topOrigins: ['Syria', 'Afghanistan', 'Iraq', 'Iran'] },
    'fr': { pressureScore: 64, trend: 'stable', topOrigins: ['Algeria', 'Morocco', 'Tunisia', 'Senegal'] },
    'cl': { pressureScore: 25, trend: 'decreasing', topOrigins: ['Venezuela', 'Colombia', 'Haiti', 'Peru'] },
    'uy': { pressureScore: 20, trend: 'stable', topOrigins: ['Argentina', 'Brazil', 'Cuba', 'Venezuela'] },
};

class ConvergenceEngine {
    private model: any = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                }
            });
        }
    }

    /**
     * Generate mock convergence data for a single country
     */
    private getMockCountryData(countryCode: string, originCode: string): CountryConvergence {
        const mockData = MOCK_PRESSURE_DATA[countryCode] || {
            pressureScore: Math.floor(Math.random() * 50) + 20,
            trend: 'stable' as const,
            topOrigins: ['Various']
        };

        const isTop15 = TOP_15_DESTINATIONS.includes(countryCode);
        const originPressureBonus = mockData.topOrigins?.includes(COUNTRY_NAMES[originCode] || '') ? 15 : 0;

        return {
            country: COUNTRY_NAMES[countryCode] || countryCode.toUpperCase(),
            countryCode,
            pressureScore: mockData.pressureScore || 40,
            pressureFromOrigin: Math.min(100, (mockData.pressureScore || 40) + originPressureBonus),
            isTop15,
            trend: mockData.trend || 'stable',
            topOrigins: mockData.topOrigins || ['Various'],
            pathwayCongestion: {
                student: Math.min(100, (mockData.pressureScore || 40) + Math.floor(Math.random() * 20)),
                skilled: Math.min(100, (mockData.pressureScore || 40) - 10 + Math.floor(Math.random() * 20)),
                investment: Math.max(10, (mockData.pressureScore || 40) - 30 + Math.floor(Math.random() * 15)),
                family: Math.min(100, (mockData.pressureScore || 40) + Math.floor(Math.random() * 10)),
            },
            predictions: this.getMockPredictions(countryCode, mockData.pressureScore || 40),
            opportunityScore: 100 - (mockData.pressureScore || 40),
        };
    }

    /**
     * Generate mock predictions based on pressure
     */
    private getMockPredictions(countryCode: string, pressure: number): ConvergencePrediction[] {
        const predictions: ConvergencePrediction[] = [];
        const countryName = COUNTRY_NAMES[countryCode] || countryCode.toUpperCase();

        if (pressure > 75) {
            predictions.push({
                type: 'warning',
                title: 'High Congestion Alert',
                summary: `${countryName} migration pathways are heavily congested. Expect policy tightening within 12-18 months.`,
                confidence: 0.82,
                timeframe: '12-18 months'
            });
        } else if (pressure > 50) {
            predictions.push({
                type: 'neutral',
                title: 'Moderate Demand',
                summary: `${countryName} shows steady migration interest. Monitor for potential processing delays.`,
                confidence: 0.65,
                timeframe: '6-12 months'
            });
        } else {
            predictions.push({
                type: 'opportunity',
                title: 'Low Competition Window',
                summary: `${countryName} has relatively low migration pressure. Favorable conditions for applications.`,
                confidence: 0.78,
                timeframe: '0-6 months'
            });
        }

        return predictions;
    }

    /**
     * Get global signals (warnings and opportunities)
     */
    getGlobalSignals(): ConvergencePrediction[] {
        return [
            {
                type: 'warning',
                title: 'Canada PGWP Congestion',
                summary: 'Post-graduation work permits facing unprecedented demand. Caps likely by Q3 2026.',
                confidence: 0.85,
                timeframe: '6-12 months'
            },
            {
                type: 'warning',
                title: 'Germany Language Bottleneck',
                summary: 'Skilled worker visas delayed due to German language certification backlogs.',
                confidence: 0.72,
                timeframe: '3-6 months'
            },
            {
                type: 'opportunity',
                title: 'Chile Entrepreneur Visa',
                summary: 'Chile introducing streamlined entrepreneur visa. Low competition window open.',
                confidence: 0.80,
                timeframe: '0-12 months'
            },
            {
                type: 'opportunity',
                title: 'Uruguay Residency Path',
                summary: 'Uruguay offers easy residency for remote workers with minimal requirements.',
                confidence: 0.88,
                timeframe: '0-6 months'
            },
            {
                type: 'neutral',
                title: 'Portugal Golden Visa Update',
                summary: 'Real estate path removed but fund investment option remains viable.',
                confidence: 0.90,
                timeframe: 'Ongoing'
            }
        ];
    }

    /**
     * Generate full convergence report
     */
    async generateReport(originCode: string, targetCodes?: string[]): Promise<ConvergenceReport> {
        const targets = targetCodes || [...TOP_15_DESTINATIONS, 'cl', 'uy', 'mx', 'jp', 'kr'];

        // If no API model, return mock data
        if (!this.model) {
            return this.getMockReport(originCode, targets);
        }

        try {
            // Try to get AI-enhanced predictions
            const prompt = `Analyze global migration convergence patterns for a ${COUNTRY_NAMES[originCode] || originCode} passport holder.

Focus on these destinations: ${targets.map(c => COUNTRY_NAMES[c] || c).join(', ')}

For each destination, provide:
1. Current migration pressure (0-100)
2. Trend (increasing/stable/decreasing)
3. Top origin countries competing for visas
4. Policy predictions for next 12-24 months

Return ONLY valid JSON matching this structure:
{
  "convergenceData": [
    {
      "countryCode": "ca",
      "pressureScore": 87,
      "trend": "increasing",
      "topOrigins": ["India", "Nigeria", "Iran"],
      "prediction": { "type": "warning", "title": "...", "summary": "...", "confidence": 0.8, "timeframe": "12 months" }
    }
  ],
  "globalSignals": [...]
}`;

            const result = await this.model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                // Merge AI data with our structure
                return this.mergeAIData(originCode, targets, data);
            }
        } catch (error: any) {
            console.error('Convergence AI Error:', error.message);
        }

        // Fallback to mock
        return this.getMockReport(originCode, targets);
    }

    /**
     * Merge AI data with mock structure
     */
    private mergeAIData(originCode: string, targets: string[], aiData: any): ConvergenceReport {
        const mockReport = this.getMockReport(originCode, targets);

        if (aiData.convergenceData) {
            for (const aiCountry of aiData.convergenceData) {
                const existing = mockReport.convergenceData.find(c => c.countryCode === aiCountry.countryCode);
                if (existing && aiCountry.prediction) {
                    existing.predictions = [aiCountry.prediction];
                    if (aiCountry.pressureScore) existing.pressureScore = aiCountry.pressureScore;
                    if (aiCountry.trend) existing.trend = aiCountry.trend;
                    if (aiCountry.topOrigins) existing.topOrigins = aiCountry.topOrigins;
                }
            }
        }

        if (aiData.globalSignals) {
            mockReport.globalSignals = aiData.globalSignals;
        }

        mockReport._thoughtSignature = 'AI-enhanced convergence analysis with real-time policy signals.';
        return mockReport;
    }

    /**
     * Get mock report
     */
    private getMockReport(originCode: string, targets: string[]): ConvergenceReport {
        return {
            originCountry: COUNTRY_NAMES[originCode] || originCode.toUpperCase(),
            convergenceData: targets.map(code => this.getMockCountryData(code, originCode)),
            globalSignals: this.getGlobalSignals(),
            generatedAt: new Date().toISOString(),
            _thoughtSignature: 'Demo mode - Pre-computed convergence patterns.'
        };
    }
}

// Singleton export
let engineInstance: ConvergenceEngine | null = null;

export function getConvergenceEngine(apiKey?: string): ConvergenceEngine {
    if (!engineInstance) {
        engineInstance = new ConvergenceEngine(apiKey || process.env.GEMINI_API_KEY);
    }
    return engineInstance;
}

export { ConvergenceEngine };
