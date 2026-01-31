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

    return {
        state,
        isLoading,
        initialize,
        updatePlan,
        updateCurrentState,
        addInterviewInsights,
        updateYearlySnapshot,
        clearState,
        exportState,
        importState,
    };
}
