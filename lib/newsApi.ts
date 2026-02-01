/**
 * News API Service
 * Fetches global news headlines relevant to migration paths
 * Uses NewsAPI.org free tier
 */

interface NewsArticle {
    title: string;
    description: string;
    source: string;
    publishedAt: string;
    url: string;
    relevance?: number;
}

interface NewsResponse {
    articles: NewsArticle[];
    totalResults: number;
    fetchedAt: Date;
}

// Cache to avoid hitting API limits
const newsCache: Map<string, { data: NewsResponse; expiry: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class NewsApiService {
    private apiKey: string | null;
    private baseUrl = 'https://newsapi.org/v2';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.NEWS_API_KEY || null;
        if (!this.apiKey) {
            console.warn('NewsApiService: No API key provided. Using mock data.');
        }
    }

    /**
     * Fetch headlines relevant to a migration path
     */
    async getRelevantNews(
        originCountry: string,
        destinationCountry: string,
        topics: string[] = ['visa', 'immigration', 'policy', 'economy']
    ): Promise<NewsResponse> {
        const cacheKey = `${originCountry}-${destinationCountry}`;

        // Check cache first
        const cached = newsCache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
            console.log('NewsAPI: Returning cached results');
            return cached.data;
        }

        if (!this.apiKey) {
            return this._getMockNews(originCountry, destinationCountry);
        }

        try {
            // Build search query
            const searchTerms = [
                destinationCountry,
                ...topics.map(t => `${destinationCountry} ${t}`)
            ].join(' OR ');

            const params = new URLSearchParams({
                q: searchTerms,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: '10'
            });

            const response = await fetch(
                `${this.baseUrl}/everything?${params}`,
                {
                    headers: {
                        'X-Api-Key': this.apiKey
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`NewsAPI error: ${response.status}`);
            }

            const data = await response.json();

            const result: NewsResponse = {
                articles: data.articles.map((a: any) => ({
                    title: a.title,
                    description: a.description,
                    source: a.source?.name || 'Unknown',
                    publishedAt: a.publishedAt,
                    url: a.url
                })),
                totalResults: data.totalResults,
                fetchedAt: new Date()
            };

            // Cache the result
            newsCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL });

            return result;

        } catch (error) {
            console.error('NewsAPI fetch failed:', error);
            return this._getMockNews(originCountry, destinationCountry);
        }
    }

    /**
     * Get top headlines for a specific country
     */
    async getCountryHeadlines(countryCode: string): Promise<NewsResponse> {
        if (!this.apiKey) {
            return this._getMockNews(countryCode, countryCode);
        }

        try {
            const params = new URLSearchParams({
                country: countryCode.toLowerCase().slice(0, 2),
                category: 'general',
                pageSize: '5'
            });

            const response = await fetch(
                `${this.baseUrl}/top-headlines?${params}`,
                {
                    headers: {
                        'X-Api-Key': this.apiKey
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`NewsAPI error: ${response.status}`);
            }

            const data = await response.json();

            return {
                articles: data.articles.map((a: any) => ({
                    title: a.title,
                    description: a.description,
                    source: a.source?.name || 'Unknown',
                    publishedAt: a.publishedAt,
                    url: a.url
                })),
                totalResults: data.totalResults,
                fetchedAt: new Date()
            };

        } catch (error) {
            console.error('NewsAPI headlines fetch failed:', error);
            return this._getMockNews(countryCode, countryCode);
        }
    }

    private _getMockNews(origin: string, destination: string): NewsResponse {
        return {
            articles: [
                {
                    title: `${destination} announces new skilled worker visa program`,
                    description: `The government of ${destination} has unveiled plans for a streamlined visa process targeting tech professionals and healthcare workers.`,
                    source: 'Global Migration Weekly',
                    publishedAt: new Date().toISOString(),
                    url: '#',
                    relevance: 0.95
                },
                {
                    title: `Economic outlook improves for ${destination} in 2026`,
                    description: 'Analysts predict strong GDP growth and increased foreign investment, boosting job opportunities.',
                    source: 'Financial Times',
                    publishedAt: new Date(Date.now() - 86400000).toISOString(),
                    url: '#',
                    relevance: 0.82
                },
                {
                    title: `${origin}-${destination} bilateral talks on mobility agreement`,
                    description: 'Both nations are negotiating a new mobility framework that could ease travel and work restrictions.',
                    source: 'Reuters',
                    publishedAt: new Date(Date.now() - 172800000).toISOString(),
                    url: '#',
                    relevance: 0.88
                }
            ],
            totalResults: 3,
            fetchedAt: new Date()
        };
    }
}

// Singleton instance
export const newsApi = new NewsApiService();
