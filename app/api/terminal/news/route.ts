/**
 * API Route: /api/terminal/news
 * Fetches global migration news
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNewsEngine } from '@/lib/newsEngine';

// Cache for 1 hour to prevent API spam
let cachedFeed: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    try {
        const now = Date.now();

        // Return cached if valid and not forcing refresh
        if (cachedFeed && !forceRefresh && (now - lastFetchTime < CACHE_DURATION)) {
            return NextResponse.json({ ...cachedFeed, _cached: true });
        }

        const engine = getNewsEngine(process.env.GEMINI_API_KEY);
        const feed = await engine.fetchGlobalNews();

        // Update cache only if live data (mock data doesn't need strict caching but it helps)
        cachedFeed = feed;
        lastFetchTime = now;

        return NextResponse.json(feed);

    } catch (error: any) {
        console.error('News API Error:', error);

        // Return fallback
        const engine = getNewsEngine();
        const fallback = engine.getMockFeed();
        return NextResponse.json({ ...fallback, _error: error.message });
    }
}
