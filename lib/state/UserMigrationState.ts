// Central state management for user migration data with session persistence

import { UserMigrationState, MigrationSnapshot, MigrationPlan, YearlySnapshot, InterviewInsight, GeopoliticalRiskProfile } from '@/types/migration';
import { z } from 'zod';

const STORAGE_KEY = 'converge_user_migration_state';
const STATE_VERSION = '1.0.0';

// Zod schema for runtime validation
const MigrationSnapshotSchema = z.object({
    timestamp: z.coerce.date(),
    location: z.string(),
    profession: z.string(),
    income: z.number(),
    skills: z.array(z.string()),
    qualifications: z.array(z.string()),
    familyStatus: z.string(),
    dependencies: z.number(),
    assets: z.number(),
    liabilities: z.number(),
    metadata: z.record(z.string(), z.any()),
});

const UserMigrationStateSchema = z.object({
    userId: z.string(),
    currentState: MigrationSnapshotSchema,
    goalState: MigrationSnapshotSchema,
    activePlan: z.any().nullable(), // MigrationPlan schema would be quite large
    timeline: z.array(z.any()), // YearlySnapshot array
    interviewData: z.array(z.any()), // InterviewInsight array
    sessionMetadata: z.object({
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        lastSimulatedYear: z.number(),
        version: z.string(),
        thoughtSignature: z.string().optional(), // Latest thought signature from Gemini
    }),
});

export class UserMigrationStateManager {
    private static instance: UserMigrationStateManager;
    private state: UserMigrationState | null = null;

    private constructor() {
        // Load state from sessionStorage on initialization
        this.loadState();
    }

    public static getInstance(): UserMigrationStateManager {
        if (!UserMigrationStateManager.instance) {
            UserMigrationStateManager.instance = new UserMigrationStateManager();
        }
        return UserMigrationStateManager.instance;
    }

    /**
     * Initialize a new user migration state
     */
    public initializeState(
        userId: string,
        currentState: MigrationSnapshot,
        goalState: MigrationSnapshot
    ): UserMigrationState {
        const now = new Date();

        this.state = {
            userId,
            currentState,
            goalState,
            activePlan: null,
            timeline: this.generateInitialTimeline(currentState),
            interviewData: [],
            sessionMetadata: {
                createdAt: now,
                updatedAt: now,
                lastSimulatedYear: 0,
                version: STATE_VERSION,
                thoughtSignature: undefined,
            },
        };

        this.saveState();
        return this.state;
    }

    /**
     * Get current state
     */
    public getState(): UserMigrationState | null {
        return this.state;
    }

    /**
     * Update migration plan
     */
    public updatePlan(plan: MigrationPlan): void {
        if (!this.state) {
            throw new Error('State not initialized');
        }

        this.state.activePlan = plan;
        this.state.sessionMetadata.updatedAt = new Date();
        this.saveState();
    }

    /**
     * Update current state snapshot
     */
    public updateCurrentState(snapshot: MigrationSnapshot): void {
        if (!this.state) {
            throw new Error('State not initialized');
        }

        this.state.currentState = snapshot;
        this.state.sessionMetadata.updatedAt = new Date();
        this.saveState();
    }

    /**
     * Add interview insights
     */
    public addInterviewInsights(insights: InterviewInsight[]): void {
        if (!this.state) {
            throw new Error('State not initialized');
        }

        this.state.interviewData.push(...insights);
        this.state.sessionMetadata.updatedAt = new Date();
        this.saveState();
    }

    /**
     * Update timeline for specific year
     */
    public updateYearlySnapshot(year: number, snapshot: YearlySnapshot): void {
        if (!this.state) {
            throw new Error('State not initialized');
        }

        const index = this.state.timeline.findIndex(t => t.year === year);
        if (index >= 0) {
            this.state.timeline[index] = snapshot;
        } else {
            this.state.timeline.push(snapshot);
            this.state.timeline.sort((a, b) => a.year - b.year);
        }

        this.state.sessionMetadata.lastSimulatedYear = Math.max(
            this.state.sessionMetadata.lastSimulatedYear,
            year
        );
        this.state.sessionMetadata.updatedAt = new Date();
        this.saveState();
    }

    /**
     * Update latest thought signature
     */
    public updateThoughtSignature(signature: string): void {
        if (!this.state) {
            throw new Error('State not initialized');
        }

        this.state.sessionMetadata.thoughtSignature = signature;
        this.state.sessionMetadata.updatedAt = new Date();
        this.saveState();
    }

    /**
     * Update geopolitical risk profile (Agent Alpha)
     */
    public updateGeopoliticalProfile(profile: GeopoliticalRiskProfile): void {
        if (!this.state) {
            throw new Error('State not initialized');
        }
        this.state.geopoliticalProfile = profile;
        // Also update the session-level thought signature with this latest reasoning if needed
        // or keep them separate. The prompt asked to "pass thought signature back to Tavus".
        // It's accessible via state.geopoliticalProfile.thoughtSignature.
        this.state.sessionMetadata.updatedAt = new Date();
        this.saveState();
    }

    /**
     * Save state to sessionStorage
     */
    private saveState(): void {
        if (typeof window === 'undefined' || !this.state) return;

        try {
            const serialized = JSON.stringify(this.state);
            sessionStorage.setItem(STORAGE_KEY, serialized);
        } catch (error) {
            console.error('Failed to save state to sessionStorage:', error);
        }
    }

    /**
     * Load state from sessionStorage
     */
    private loadState(): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (!stored) return;

            const parsed = JSON.parse(stored);

            // Validate with Zod
            const validated = UserMigrationStateSchema.parse(parsed);
            this.state = validated as UserMigrationState;

            console.log('Loaded user migration state from session');
        } catch (error) {
            console.error('Failed to load state from sessionStorage:', error);
            // Clear invalid state
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }

    /**
     * Clear state and storage
     */
    public clearState(): void {
        this.state = null;
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }

    /**
     * Generate initial timeline with empty snapshots for 10 years
     */
    private generateInitialTimeline(currentState: MigrationSnapshot): YearlySnapshot[] {
        return Array.from({ length: 11 }, (_, i) => ({
            year: i,
            state: i === 0 ? currentState : { ...currentState }, // Clone for future years
            completedSteps: [],
            upcomingSteps: [],
            variance: {
                financial: 0,
                timeline: 0,
                probability: 1.0,
            },
        }));
    }

    /**
     * Export state as JSON for backup
     */
    public exportState(): string {
        if (!this.state) {
            throw new Error('No state to export');
        }
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Import state from JSON
     */
    public importState(json: string): void {
        try {
            const parsed = JSON.parse(json);
            const validated = UserMigrationStateSchema.parse(parsed);
            this.state = validated as UserMigrationState;
            this.saveState();
        } catch (error) {
            throw new Error(`Failed to import state: ${error}`);
        }
    }
}

// Export singleton instance
export const stateManager = UserMigrationStateManager.getInstance();
