/**
 * News Engine
 * Fetches and processes global migration news using Gemini with Search Grounding
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type NewsCategory = 'policy' | 'crisis' | 'innovation' | 'passport';

export interface NewsItem {
    id: string;
    headline: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string;
    category: NewsCategory;
    region?: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
}

export interface NewsFeed {
    items: NewsItem[];
    generatedAt: string;
    source: 'live' | 'demo';
}

const MOCK_NEWS: NewsItem[] = [
    {
        id: '1',
        headline: 'Canada Caps International Student Visas for 2026',
        summary: 'Immigration Refugees and Citizenship Canada (IRCC) announces a 35% reduction in study permits to alleviate housing pressure.',
        url: 'https://example.com/canada-student-cap',
        source: 'Global Migration News',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        category: 'policy',
        region: 'North America',
        sentiment: 'negative',
        confidence: 0.95
    },
    {
        id: '2',
        headline: 'Germany Launches "Opportunity Card" for Skilled Workers',
        summary: 'New points-based system allows non-EU workers to enter Germany to look for jobs without a prior offer.',
        url: 'https://example.com/germany-chancenkarte',
        source: 'EU Daily',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        category: 'innovation',
        region: 'Europe',
        sentiment: 'positive',
        confidence: 0.92
    },
    {
        id: '3',
        headline: 'Japan Updates Digital Nomad Visa Requirements',
        summary: 'Income threshold lowered for specific tech categories to attract more remote talent from Southeast Asia.',
        url: 'https://example.com/japan-nomad-update',
        source: 'Asia Tech Wire',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        category: 'policy',
        region: 'Asia',
        sentiment: 'positive',
        confidence: 0.88
    },
    {
        id: '4',
        headline: 'Sudan Displacement Crisis Reaches New Peak',
        summary: 'UNHCR reports record numbers of displaced persons seeking refuge in neighboring Chad and Egypt.',
        url: 'https://example.com/sudan-crisis',
        source: 'Humanitarian Watch',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        category: 'crisis',
        region: 'Africa',
        sentiment: 'negative',
        confidence: 0.98
    },
    {
        id: '5',
        headline: 'Henley Passport Index: Singapore Remains Top',
        summary: 'Singapore holds the most powerful passport title, with visa-free access to 192 destinations.',
        url: 'https://example.com/henley-index-update',
        source: 'Travel Insights',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        category: 'passport',
        region: 'Global',
        sentiment: 'neutral',
        confidence: 0.99
    },
    {
        id: '6',
        headline: 'UK Increases Minimum Salary for Family Visas',
        summary: 'The threshold for sponsoring family members has risen to £29,000, sparking debate among advocacy groups.',
        url: 'https://example.com/uk-family-visa',
        source: 'London Gazette',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        category: 'policy',
        region: 'Europe',
        sentiment: 'negative',
        confidence: 0.90
    },
    {
        id: '7',
        headline: 'Portugal Golden Visa Fund Route Sees Surge',
        summary: 'Following the removal of real estate options, investment funds become the primary vehicle for residency.',
        url: 'https://example.com/portugal-funds',
        source: 'Investment Weekly',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        category: 'innovation',
        region: 'Europe',
        sentiment: 'positive',
        confidence: 0.85
    }
];

class NewsEngine {
    private model: any = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                tools: [{ googleSearch: {} }] as any
            });
        }
    }

    /**
     * Fetch global news using Gemini Search Grounding
     */
    async fetchGlobalNews(): Promise<NewsFeed> {
        if (!this.model) {
            console.log('NewsEngine: Using mock data (No API Key)');
            return this.getMockFeed();
        }

        try {
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const prompt = `Find the latest global news regarding "migration policy", "visa changes", "refugee crisis", and "digital nomad visas" for today, ${today}.
            
            Return 8-10 distinct news items.
            For each item, provide a JSON object with:
            - headline (concise title)
            - summary (1-2 sentences)
            - url (source link)
            - source (publisher name)
            - published_at (ISO string if available, or "recent")
            - category (choose exactly one: "policy", "crisis", "innovation", "passport")
            - region (e.g., "Europe", "North America", "Global")
            - sentiment ("positive", "negative", "neutral")
            
            Return ONLY a valid JSON array of these objects.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('NewsEngine: Failed to parse JSON from AI response');
                return this.getMockFeed();
            }

            const parsedItems = JSON.parse(jsonMatch[0]);

            const items: NewsItem[] = parsedItems.map((item: any, index: number) => ({
                id: `live-${Date.now()}-${index}`,
                headline: item.headline,
                summary: item.summary,
                url: item.url || '#',
                source: item.source || 'AI Summary',
                publishedAt: item.published_at === 'recent' ? new Date().toISOString() : (item.published_at || new Date().toISOString()),
                category: this.validateCategory(item.category),
                region: item.region || 'Global',
                sentiment: item.sentiment || 'neutral',
                confidence: 0.9
            }));

            // Filter out clearly invalid items
            const validItems = items.filter(item => item.headline && item.summary);

            if (validItems.length === 0) {
                return this.getMockFeed();
            }

            return {
                items: validItems,
                generatedAt: new Date().toISOString(),
                source: 'live'
            };

        } catch (error: any) {
            console.error('NewsEngine API Error:', error.message);
            return this.getMockFeed();
        }
    }

    private validateCategory(cat: string): NewsCategory {
        const valid = ['policy', 'crisis', 'innovation', 'passport'];
        if (valid.includes(cat.toLowerCase())) return cat.toLowerCase() as NewsCategory;
        return 'policy'; // Default
    }

    getMockFeed(): NewsFeed {
        return {
            items: MOCK_NEWS,
            generatedAt: new Date().toISOString(),
            source: 'demo'
        };
    }
}

// Singleton export
let engineInstance: NewsEngine | null = null;

export function getNewsEngine(apiKey?: string): NewsEngine {
    if (!engineInstance) {
        engineInstance = new NewsEngine(apiKey || process.env.GEMINI_API_KEY);
    }
    return engineInstance;
}
