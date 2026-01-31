'use client';

import { useState, useEffect } from 'react';
import ConvergenceMap from '@/components/ConvergenceMap';
import { useUserMigrationState } from '@/hooks/useUserMigrationState';
import { MigrationSnapshot, MigrationPlan, MigrationStep } from '@/types/migration';

export default function Home() {
  const {
    state,
    isLoading,
    initialize,
    updatePlan,
  } = useUserMigrationState();

  const [currentYear, setCurrentYear] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStep, setSelectedStep] = useState<MigrationStep | null>(null);

  // Initialize demo state on first load
  useEffect(() => {
    if (!state && !isLoading) {
      // Demo current state
      const demoCurrentState: MigrationSnapshot = {
        timestamp: new Date(),
        location: 'Lagos, Nigeria',
        profession: 'Software Engineer',
        income: 45000,
        skills: ['JavaScript', 'React', 'Node.js'],
        qualifications: ['B.Sc. Computer Science'],
        familyStatus: 'Single',
        dependencies: 0,
        assets: 15000,
        liabilities: 5000,
        metadata: {},
      };

      // Demo goal state
      const demoGoalState: MigrationSnapshot = {
        timestamp: new Date(),
        location: 'Toronto, Canada',
        profession: 'Senior Software Engineer',
        income: 120000,
        skills: ['TypeScript', 'React', 'Node.js', 'AWS', 'System Design'],
        qualifications: ['B.Sc. Computer Science', 'AWS Certification'],
        familyStatus: 'Single',
        dependencies: 0,
        assets: 100000,
        liabilities: 0,
        metadata: {},
      };

      initialize('demo_user', demoCurrentState, demoGoalState);
    }
  }, [state, isLoading, initialize]);

  const handleGeneratePlan = async () => {
    if (!state) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentState: state.currentState,
          goalState: state.goalState,
          timeframe: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      updatePlan(data.plan);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate migration plan. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      const response = await fetch('/api/tavus/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state?.userId || 'demo_user',
          interviewType: 'initial',
          context: {
            currentPlan: state?.activePlan,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();
      alert(`Interview initiated! Session ID: ${data.sessionId}`);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Check console for details.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-white text-xl">Loading CONVERGE...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                CONVERGE
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Goal-Conditioned Migration Planning
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating || !state}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    Generating...
                  </span>
                ) : (
                  '🤖 Generate Plan'
                )}
              </button>
              <button
                onClick={handleStartInterview}
                disabled={!state}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-700 disabled:to-slate-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                🎥 Start Interview
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Current State Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              📍 Current State
            </h2>
            {state && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white font-medium">{state.currentState.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profession:</span>
                  <span className="text-white font-medium">{state.currentState.profession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Income:</span>
                  <span className="text-white font-medium">${state.currentState.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assets:</span>
                  <span className="text-emerald-400 font-medium">${state.currentState.assets.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              🎯 Goal State
            </h2>
            {state && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white font-medium">{state.goalState.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profession:</span>
                  <span className="text-white font-medium">{state.goalState.profession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Income:</span>
                  <span className="text-white font-medium">${state.goalState.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Assets:</span>
                  <span className="text-emerald-400 font-medium">${state.goalState.assets.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Timeline</h2>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Year {currentYear.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.25"
            value={currentYear}
            onChange={(e) => setCurrentYear(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Year 0</span>
            <span>Year 5</span>
            <span>Year 10</span>
          </div>
        </div>

        {/* Convergence Map */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6 mb-8">
          <div className="h-[600px]">
            <ConvergenceMap
              migrationPlan={state?.activePlan || null}
              currentYear={currentYear}
              onNodeClick={(step) => setSelectedStep(step)}
              animationSpeed={1.0}
            />
          </div>
        </div>

        {/* Selected Step Details */}
        {selectedStep && (
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl border border-blue-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Step Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-400">Title:</span>
                <p className="text-lg font-semibold text-white">{selectedStep.title}</p>
              </div>
              <div>
                <span className="text-sm text-slate-400">Description:</span>
                <p className="text-white">{selectedStep.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-400">Timeline:</span>
                  <p className="text-white">Year {selectedStep.year}, Q{selectedStep.quarter}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400">Duration:</span>
                  <p className="text-white">{selectedStep.expectedDuration} months</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400">Cost:</span>
                  <p className="text-emerald-400 font-semibold">${selectedStep.expectedCost.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400">Success Rate:</span>
                  <p className="text-blue-400 font-semibold">{(selectedStep.probability * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl mt-12">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-slate-500">
          Powered by Gemini 3 API & Tavus CVI | CONVERGE v1.0.0
        </div>
      </footer>
    </div>
  );
}
