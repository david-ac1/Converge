// React hook for accessing and updating UserMigrationState

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserMigrationState, MigrationSnapshot, MigrationPlan, YearlySnapshot, InterviewInsight } from '@/types/migration';
import { stateManager } from '@/lib/state/UserMigrationState';

export function useUserMigrationState() {
    const [state, setState] = useState<UserMigrationState | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load state on mount
    useEffect(() => {
        const loadedState = stateManager.getState();
        setState(loadedState);
        setIsLoading(false);
    }, []);

    // Initialize new state
    const initialize = useCallback((
        userId: string,
        currentState: MigrationSnapshot,
        goalState: MigrationSnapshot
    ) => {
        const newState = stateManager.initializeState(userId, currentState, goalState);
        setState(newState);
    }, []);


    // Update migration plan
    const updatePlan = useCallback((plan: MigrationPlan) => {
        stateManager.updatePlan(plan);
        setState(stateManager.getState());
    }, []);

    // Update current state
    const updateCurrentState = useCallback((snapshot: MigrationSnapshot) => {
        stateManager.updateCurrentState(snapshot);
        setState(stateManager.getState());
    }, []);

    // Add interview insights
    const addInterviewInsights = useCallback((insights: InterviewInsight[]) => {
        stateManager.addInterviewInsights(insights);
        setState(stateManager.getState());
    }, []);

    // Update yearly snapshot
    const updateYearlySnapshot = useCallback((year: number, snapshot: YearlySnapshot) => {
        stateManager.updateYearlySnapshot(year, snapshot);
        setState(stateManager.getState());
    }, []);

    // Update thought signature
    const updateThoughtSignature = useCallback((signature: string) => {
        stateManager.updateThoughtSignature(signature);
        setState(stateManager.getState());
    }, []);

    // Clear state
    const clearState = useCallback(() => {
        stateManager.clearState();
        setState(null);
    }, []);

    // Export state
    const exportState = useCallback(() => {
        return stateManager.exportState();
    }, []);

    // Import state
    const importState = useCallback((json: string) => {
        stateManager.importState(json);
        setState(stateManager.getState());
    }, []);

    // Generate Plan (API Integration)
    const generatePlan = useCallback(async (timeframe: number = 10) => {
        const currentState = stateManager.getState()?.currentState;
        const goalState = stateManager.getState()?.goalState;

        if (!currentState || !goalState) {
            throw new Error("Current or Goal state missing");
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/gemini/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentState, goalState, timeframe })
            });

            if (!response.ok) throw new Error('Plan generation failed');

            const data = await response.json();

            if (data.plan) {
                stateManager.updatePlan(data.plan);
            }

            if (data.thoughtSignature) {
                stateManager.updateThoughtSignature(data.thoughtSignature);
            } else if (data.reasoning) {
                // Fallback to reasoning if thoughtSignature absent
                stateManager.updateThoughtSignature(data.reasoning);
            }

            setState(stateManager.getState());
            return data.plan;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update Geopolitical Profile (Agent Alpha)
    const updateGeopoliticalProfile = useCallback((profile: any) => {
        stateManager.updateGeopoliticalProfile(profile);
        setState(stateManager.getState());
    }, []);

    // Atomic initialization and simulation start
    const initializeSimulation = useCallback(async (
        userId: string,
        currentState: MigrationSnapshot,
        goalState: MigrationSnapshot,
        initialSignature: string
    ) => {
        setIsLoading(true);
        try {
            // 1. Initialize core state
            stateManager.initializeState(userId, currentState, goalState);

            // 2. Set signature
            stateManager.updateThoughtSignature(initialSignature);

            // 3. Update React state
            const stateWithSignature = stateManager.getState();
            setState(stateWithSignature);

            // 4. Trigger plan generation immediately
            const planResult = await generatePlan(10);

            return { state: stateManager.getState(), plan: planResult };
        } finally {
            setIsLoading(false);
        }
    }, [generatePlan]);

    return {
        state,
        isLoading,
        initialize,
        updatePlan,
        updateCurrentState,
        addInterviewInsights,
        updateYearlySnapshot,
        updateThoughtSignature,
        updateGeopoliticalProfile,
        generatePlan,
        clearState,
        exportState,
        importState,
        initializeSimulation,
    };
}
