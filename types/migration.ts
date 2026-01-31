// TypeScript type definitions for CONVERGE migration system

export interface MigrationSnapshot {
  timestamp: Date;
  location: string;
  profession: string;
  income: number;
  skills: string[];
  qualifications: string[];
  familyStatus: string;
  dependencies: number;
  assets: number;
  liabilities: number;
  metadata: Record<string, any>;
}

export interface MigrationStep {
  id: string;
  year: number;
  quarter: number;
  title: string;
  description: string;
  category: 'skill' | 'financial' | 'legal' | 'relocation' | 'network' | 'other';
  requirements: string[];
  expectedCost: number;
  expectedDuration: number; // in months
  probability: number; // 0-1
  dependencies: string[]; // step IDs
  outcomes: {
    optimistic: MigrationSnapshot;
    realistic: MigrationSnapshot;
    pessimistic: MigrationSnapshot;
  };
}

export interface MigrationPlan {
  id: string;
  userId: string;
  startState: MigrationSnapshot;
  goalState: MigrationSnapshot;
  timeframe: number; // in years
  steps: MigrationStep[];
  totalEstimatedCost: number;
  successProbability: number;
  criticalPath: string[]; // step IDs in critical path
  createdAt: Date;
  updatedAt: Date;
}

export interface YearlySnapshot {
  year: number;
  state: MigrationSnapshot;
  completedSteps: string[]; // step IDs
  upcomingSteps: string[];
  variance: {
    financial: number; // percentage deviation from plan
    timeline: number; // months ahead/behind
    probability: number; // current success probability
  };
}

export interface InterviewInsight {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: 'motivation' | 'concern' | 'constraint' | 'preference' | 'goal';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  impactOnPlan: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
}

export interface GeminiPlanRequest {
  currentState: MigrationSnapshot;
  goalState: MigrationSnapshot;
  timeframe: number;
  constraints?: {
    maxBudget?: number;
    preferredLocations?: string[];
    familyConsiderations?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
  };
  previousInterviews?: InterviewInsight[];
}

export interface GeminiPlanResponse {
  plan: MigrationPlan;
  reasoning: string;
  alternativeStrategies: {
    name: string;
    description: string;
    tradeoffs: string;
  }[];
  risks: {
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
  }[];
  confidence: number; // 0-1
}

export interface UserMigrationState {
  userId: string;
  currentState: MigrationSnapshot;
  goalState: MigrationSnapshot;
  activePlan: MigrationPlan | null;
  timeline: YearlySnapshot[]; // 0-10 years
  interviewData: InterviewInsight[];
  sessionMetadata: {
    createdAt: Date;
    updatedAt: Date;
    lastSimulatedYear: number;
    version: string;
  };
}

export interface TavusInterviewRequest {
  userId: string;
  interviewType: 'initial' | 'followup' | 'verification';
  context: {
    currentPlan?: MigrationPlan;
    specificQuestions?: string[];
    focusAreas?: string[];
  };
  metadata?: Record<string, any>;
}

export interface TavusInterviewResponse {
  sessionId: string;
  streamUrl: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
  estimatedDuration: number; // in minutes
}

export interface TavusWebhookPayload {
  sessionId: string;
  event: 'started' | 'completed' | 'failed' | 'transcript_update';
  timestamp: Date;
  data: {
    transcript?: string;
    insights?: InterviewInsight[];
    duration?: number;
    error?: string;
  };
}
