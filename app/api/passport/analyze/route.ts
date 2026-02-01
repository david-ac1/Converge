
import { NextRequest, NextResponse } from 'next/server';
import { passportLogic } from '@/lib/passportLogic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { passportId, context, type, country } = body;

        if (type === 'henley') {
            const henleyData = await passportLogic.fetchHenleyData(country || passportId);
            return NextResponse.json(henleyData);
        }

        if (!passportId) {
            return NextResponse.json({ error: 'Passport ID required' }, { status: 400 });
        }

        const profile = await passportLogic.analyzePassport(passportId, context || {});

        return NextResponse.json(profile);
    } catch (error: any) {
        console.error('Passport Analysis API Error:', error);
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
    }
}
