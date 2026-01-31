This Product Requirement Document (PRD) is designed to act as the "Source of Truth" for your Antigravity agents. By providing this level of technical granularity—referenced directly from our Stitch UI—we eliminate the "creative drift" that often leads to AI hallucinations.

📑 PRD: CONVERGE — Migration Path Simulator (v1.0)
Status: Architecture Locked

Lead Architect: Gemini (Senior AI Architect)

Design Paradigm: Technical Blueprint / Industrial Precision

1. Product Executive Summary
CONVERGE is an autonomous planning engine that simulates 10-year global mobility trajectories. It replaces static eligibility checks with dynamic risk-modeling, leveraging Gemini 3’s long-horizon reasoning to adapt plans based on "Policy Drift" and "Passport Reputation."

2. Technical Stack (The "Vibe" Stack)
Frontend: Next.js 14 (App Router), Tailwind CSS, Framer Motion.

AI Kernel: Gemini 3 Pro (via Google AI Studio) for reasoning; Gemini 2.0 Flash for low-latency Tavus orchestration.

Interface: Tavus CVI (Phoenix-4) for real-time video consultation.

Assets: Nano Banana Pro for blueprint-style SVG generation.

IDE/Agentic Layer: Google Antigravity (Mission Control).

3. UI/UX Requirements (Derived from Stitch)
3.1 Visual Specifications
Theme: #0D0D0D (Charcoal) background with #00D1FF (Cyan) and #FFFFFF (White) accents.

Typography: Inter Tight (Headers), JetBrains Mono (Technical Data/Labels).

Components:

Landing (/home): Hero section with "Deconstructed Passport" schematic.

Simulation (/dashboard): * Left: "Volatility Radar" (Analog-style dials).

Center: "Convergence Map" (SVG Tree with 1px line weight).

Right: "Expert Hub" (Tavus Video Bubble).

4. Functional Requirements & Logic Gates
4.1 The Planning Engine (migrationEngine.js)
Backward Reasoning: Must take Target_State (e.g., German Citizenship) and calculate Prerequisite_Chains (Language -> Residency -> Tax Compliance).

Policy Drift Interpreter: Must accept a Shock_Event string (e.g., "UK Dependant Ban") and return a Fracture_Report identifying which path nodes are now "Brittle."

4.2 User State Schema (UserMigrationState.ts)
TypeScript
interface UserMigrationState {
  profile: { passport: string; age: number; profession: string; budget: number };
  scenarios: {
    id: string;
    pathName: string; // e.g., "The Academic Bridge"
    nodes: MigrationNode[];
    resilienceScore: number; // 0.0 - 1.0
  }[];
  activeShock: string | null;
}
5. Implementation Plan (9-Day Sprint)
Phase 1: Foundation (Days 1–2) — "The Skeleton"
Task 1.1: Initialize Antigravity project with the Stitch-exported React code.

Task 1.2: Configure Google AI Studio API and Tavus credentials in .env.local.

Task 1.3: Implement the Zod-validated UserMigrationState to ensure state persistence across components.

Phase 2: Intelligence (Days 3–5) — "The Brain"
Task 2.1: Build the generateMigrationPlan function using Gemini 3’s Thinking Level: High.

Task 2.2: Connect the Tavus CVI to the state. When the user moves the timeline scrubber, the Tavus Agent must receive a context update via session_view_update.

Task 2.3: Use Nano Banana Pro to generate the specific "Blueprint" icons for the Skill, Legal, and Financial nodes.

Phase 3: Stress-Testing & Polish (Days 6–8) — "The Action Era"
Task 3.1: Implement the "System Boot" sequence. (CSS: @keyframes grid-flicker).

Task 3.2: Execute "Policy Shock" simulations. Verify that the ConvergenceMap visually "fractures" brittle nodes.

Task 3.3: Use Antigravity’s Verification Agent to browse official 2026 portals to ground the final demo data in truth.

Phase 4: Submission (Day 9) — "The Demo"
Task 4.1: Record the 3-minute demo video showing the transition from Landing -> Dashboard -> Policy Shock -> Recalculation.