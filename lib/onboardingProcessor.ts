/**
 * Onboarding Processor
 * Parses Tavus conversation transcripts to extract user data
 * Then triggers Gemini plan generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface OnboardingData {
    name: string;
    nationality: string;
    currentLocation: string;
    migrationGoal: 'citizenship' | 'residency' | 'work' | 'study' | 'investment' | 'other';
    age: number | null;
    incomeRange: string;
    destination: string;
    rawTranscript?: string;
    extractedAt: Date;
}

export class OnboardingProcessor {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (key) {
            this.genAI = new GoogleGenerativeAI(key);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                    temperature: 0.3, // Low temp for extraction
                }
            });
        }
    }

    /**
     * Extract structured onboarding data from a conversation transcript
     */
    async parseTranscript(transcript: string): Promise<OnboardingData> {
        if (!this.model) {
            return this._mockParse(transcript);
        }

        try {
            const prompt = `
Extract the following information from this conversation transcript between an AI advisor (ARIA) and a user.

TRANSCRIPT:
${transcript}

Extract and return a JSON object with these fields:
{
    "name": "User's name",
    "nationality": "User's nationality/passport country",
    "currentLocation": "Where they currently live",
    "migrationGoal": "One of: citizenship, residency, work, study, investment, other",
    "age": Number or null if not mentioned,
    "incomeRange": "Their stated income range or 'not specified'",
    "destination": "Where they want to migrate to"
}

If any field is not clearly mentioned, make reasonable inferences from context or use null/empty string.
Return ONLY the JSON object, no markdown.
`;

            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const json = JSON.parse(jsonMatch ? jsonMatch[0] : text);

            return {
                name: json.name || 'Unknown',
                nationality: json.nationality || 'Unknown',
                currentLocation: json.currentLocation || json.nationality || 'Unknown',
                migrationGoal: this._normalizeGoal(json.migrationGoal),
                age: typeof json.age === 'number' ? json.age : null,
                incomeRange: json.incomeRange || 'not specified',
                destination: json.destination || 'Unknown',
                rawTranscript: transcript,
                extractedAt: new Date()
            };

        } catch (error) {
            console.error('Transcript parsing failed:', error);
            return this._mockParse(transcript);
        }
    }

    /**
     * Convert OnboardingData to MigrationSnapshot format
     */
    toMigrationSnapshot(data: OnboardingData): {
        currentState: any;
        goalState: any;
    } {
        // Map income range to approximate number
        const incomeMap: Record<string, number> = {
            'under 30k': 25000,
            '30-50k': 40000,
            '50-75k': 62500,
            '75-100k': 87500,
            '100-150k': 125000,
            '150k+': 175000,
            'over 150k': 200000,
            'not specified': 60000 // Default estimate
        };

        const incomeKey = Object.keys(incomeMap).find(k =>
            data.incomeRange.toLowerCase().includes(k.split('-')[0]) ||
            data.incomeRange.toLowerCase().includes(k)
        ) || 'not specified';

        return {
            currentState: {
                timestamp: new Date(),
                location: data.currentLocation,
                profession: 'Professional', // Will be refined later
                income: incomeMap[incomeKey],
                skills: [],
                qualifications: [],
                familyStatus: 'unknown',
                dependencies: 0,
                assets: 0,
                liabilities: 0,
                metadata: {
                    citizenship: data.nationality,
                    name: data.name,
                    age: data.age,
                    migrationGoal: data.migrationGoal
                }
            },
            goalState: {
                timestamp: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years
                location: data.destination,
                profession: 'Professional',
                income: incomeMap[incomeKey] * 1.5, // Assume 50% income growth
                skills: [],
                qualifications: [],
                familyStatus: 'unknown',
                dependencies: 0,
                assets: 0,
                liabilities: 0,
                metadata: {
                    targetStatus: data.migrationGoal
                }
            }
        };
    }

    private _normalizeGoal(goal: string): OnboardingData['migrationGoal'] {
        const normalized = goal?.toLowerCase() || '';
        if (normalized.includes('citizen')) return 'citizenship';
        if (normalized.includes('residen')) return 'residency';
        if (normalized.includes('work') || normalized.includes('job')) return 'work';
        if (normalized.includes('study') || normalized.includes('education')) return 'study';
        if (normalized.includes('invest')) return 'investment';
        return 'other';
    }

    private _mockParse(transcript: string): OnboardingData {
        // Extract name from "my name is X" pattern
        const nameMatch = transcript.match(/(?:my name is|i'm|i am)\s+(\w+)/i);

        return {
            name: nameMatch ? nameMatch[1] : 'User',
            nationality: 'United States',
            currentLocation: 'United States',
            migrationGoal: 'residency',
            age: 35,
            incomeRange: '75-100k',
            destination: 'Switzerland',
            rawTranscript: transcript,
            extractedAt: new Date()
        };
    }
}

// Singleton
export const onboardingProcessor = new OnboardingProcessor();
