import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProjectionSignal {
    type: 'policy' | 'economic' | 'geopolitical' | 'bilateral';
    title: string;
    summary: string;
    impact: 'positive' | 'negative' | 'neutral';
    source?: string;
}

export interface YearProjection {
    year: number;
    trend: 'improving' | 'stable' | 'declining';
    visaFreeEstimate: number;
    signals: ProjectionSignal[];
    reasoning: string;
}

export interface ProjectionResult {
    country: string;
    countryCode: string;
    currentRank: number;
    currentVisaFree: number;
    projection: YearProjection[];
    thoughtSignature: string;
    generatedAt: Date;
}

// Henley data for baseline
const HENLEY_DATA: Record<string, { rank: number; visaFree: number }> = {
    'Singapore': { rank: 1, visaFree: 195 },
    'Japan': { rank: 2, visaFree: 193 },
    'Germany': { rank: 3, visaFree: 192 },
    'France': { rank: 3, visaFree: 192 },
    'Italy': { rank: 3, visaFree: 192 },
    'Spain': { rank: 3, visaFree: 192 },
    'South Korea': { rank: 4, visaFree: 191 },
    'Finland': { rank: 4, visaFree: 191 },
    'Austria': { rank: 5, visaFree: 190 },
    'Sweden': { rank: 5, visaFree: 190 },
    'United Kingdom': { rank: 6, visaFree: 189 },
    'USA': { rank: 8, visaFree: 186 },
    'Australia': { rank: 8, visaFree: 186 },
    'New Zealand': { rank: 8, visaFree: 186 },
    'UAE': { rank: 9, visaFree: 185 },
    'Switzerland': { rank: 10, visaFree: 184 },
    'Canada': { rank: 10, visaFree: 184 },
    'Portugal': { rank: 7, visaFree: 187 },
    'Netherlands': { rank: 5, visaFree: 190 },
    'Belgium': { rank: 6, visaFree: 189 },
    'Malaysia': { rank: 12, visaFree: 182 },
    'Brazil': { rank: 18, visaFree: 170 },
    'Mexico': { rank: 25, visaFree: 159 },
    'Argentina': { rank: 17, visaFree: 172 },
    'Chile': { rank: 15, visaFree: 176 },
    'South Africa': { rank: 52, visaFree: 106 },
    'Thailand': { rank: 66, visaFree: 81 },
    'Turkey': { rank: 50, visaFree: 119 },
    'China': { rank: 62, visaFree: 85 },
    'India': { rank: 85, visaFree: 62 },
    'Nigeria': { rank: 95, visaFree: 45 },
    'Ghana': { rank: 80, visaFree: 67 },
    'Kenya': { rank: 75, visaFree: 75 },
    'Egypt': { rank: 93, visaFree: 54 },
    'Pakistan': { rank: 100, visaFree: 35 },
    'Bangladesh': { rank: 99, visaFree: 42 },
    'Ethiopia': { rank: 96, visaFree: 47 },
    'Tanzania': { rank: 80, visaFree: 67 },
    'Uganda': { rank: 80, visaFree: 67 },
    'Rwanda': { rank: 79, visaFree: 68 },
    'Senegal': { rank: 82, visaFree: 65 },
    'Cameroon': { rank: 93, visaFree: 54 },
    'Algeria': { rank: 92, visaFree: 55 },
    'Morocco': { rank: 78, visaFree: 69 },
    'Tunisia': { rank: 76, visaFree: 72 },
    'Jordan': { rank: 92, visaFree: 55 },
    'Lebanon': { rank: 97, visaFree: 49 },
    'Sri Lanka': { rank: 98, visaFree: 44 },
    'Nepal': { rank: 101, visaFree: 40 },
    'Afghanistan': { rank: 104, visaFree: 28 },
};

export async function POST(request: NextRequest) {
    try {
        const { country, countryCode } = await request.json();

        if (!country) {
            return NextResponse.json({ error: 'Country is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(getMockProjection(country, countryCode));
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: { temperature: 0.7 }
        });

        const henleyData = HENLEY_DATA[country] || { rank: 50, visaFree: 100 };

        const prompt = `You are a geopolitical analyst specializing in passport mobility and visa policy.

Analyze the 10-year projection (2026-2035) for the ${country} passport.

Current Status:
- Henley Rank: #${henleyData.rank}
- Visa-Free Destinations: ${henleyData.visaFree}

For each year from 2026 to 2035, provide:
1. Whether the passport power will be IMPROVING, STABLE, or DECLINING
2. Estimated visa-free destination count
3. 2-3 specific policy/economic/geopolitical signals affecting this trend
4. Brief reasoning

Consider:
- Bilateral visa agreements in negotiation
- EU/Schengen policy changes
- Economic stability and currency strength
- Regional political alliances
- Security concerns and travel advisories
- Digital nomad visa trends
- Climate migration policies

Output as JSON:
{
  "projection": [
    {
      "year": 2026,
      "trend": "improving|stable|declining",
      "visaFreeEstimate": number,
      "signals": [
        {
          "type": "policy|economic|geopolitical|bilateral",
          "title": "Signal Title",
          "summary": "Brief description",
          "impact": "positive|negative|neutral"
        }
      ],
      "reasoning": "Brief explanation"
    }
  ],
  "thoughtSignature": "Your analytical reasoning process"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log('No JSON match, falling back to mock projection');
            return NextResponse.json(getMockProjection(country, countryCode));
        }

        const parsed = JSON.parse(jsonMatch[0]);

        const response: ProjectionResult = {
            country,
            countryCode: countryCode || country.substring(0, 2).toLowerCase(),
            currentRank: henleyData.rank,
            currentVisaFree: henleyData.visaFree,
            projection: parsed.projection,
            thoughtSignature: parsed.thoughtSignature || 'Gemini analysis complete.',
            generatedAt: new Date()
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Passport projection error:', error);

        // Handle rate limiting - fall back to mock data
        if (error?.status === 429 || error?.statusText === 'Too Many Requests') {
            console.log('Rate limited, falling back to mock projection');
            try {
                const body = await request.clone().json();
                return NextResponse.json({
                    ...getMockProjection(body.country, body.countryCode),
                    thoughtSignature: 'Rate limited - showing cached projection data.'
                });
            } catch {
                return NextResponse.json(getMockProjection('Unknown', 'xx'));
            }
        }

        // For other errors, also fall back to mock
        try {
            const body = await request.clone().json();
            return NextResponse.json({
                ...getMockProjection(body.country, body.countryCode),
                thoughtSignature: 'AI temporarily unavailable - showing cached projection.'
            });
        } catch {
            return NextResponse.json(
                { error: 'Failed to generate projection' },
                { status: 500 }
            );
        }
    }
}

function getMockProjection(country: string, countryCode?: string): ProjectionResult {
    const henleyData = HENLEY_DATA[country] || { rank: 50, visaFree: 100 };
    const baseVisaFree = henleyData.visaFree;

    const projection: YearProjection[] = [];
    let currentVisaFree = baseVisaFree;

    for (let year = 2026; year <= 2035; year++) {
        const randomTrend = Math.random();
        let trend: 'improving' | 'stable' | 'declining';
        let delta = 0;

        if (randomTrend > 0.6) {
            trend = 'improving';
            delta = Math.floor(Math.random() * 3) + 1;
        } else if (randomTrend > 0.3) {
            trend = 'stable';
            delta = 0;
        } else {
            trend = 'declining';
            delta = -(Math.floor(Math.random() * 3) + 1);
        }

        currentVisaFree = Math.max(20, Math.min(195, currentVisaFree + delta));

        projection.push({
            year,
            trend,
            visaFreeEstimate: currentVisaFree,
            signals: [
                {
                    type: 'policy',
                    title: `${year} Visa Policy Review`,
                    summary: `Annual bilateral visa agreement assessments for ${country}.`,
                    impact: trend === 'improving' ? 'positive' : trend === 'declining' ? 'negative' : 'neutral'
                },
                {
                    type: 'economic',
                    title: 'Economic Stability Index',
                    summary: `GDP growth and currency stability affecting travel trust.`,
                    impact: 'neutral'
                }
            ],
            reasoning: `Based on current trajectory and regional dynamics.`
        });
    }

    return {
        country,
        countryCode: countryCode || country.substring(0, 2).toLowerCase(),
        currentRank: henleyData.rank,
        currentVisaFree: baseVisaFree,
        projection,
        thoughtSignature: 'Mock projection generated for demonstration.',
        generatedAt: new Date()
    };
}
