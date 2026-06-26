export type Role = "user" | "assistant";

export interface Msg {
  role: Role;
  content: string;
}

export interface Phase {
  name: string;
  weeks: string;
  focus: string;
}

export interface Estimation {
  complexityScore: number; // 1–10
  complexityLabel: string; // e.g. "Moderate"
  timeline: string; // e.g. "8–12 weeks"
  teamSize: string; // e.g. "3–4 specialists"
  budgetRange: string; // a professional range, never an exact price
  phases: Phase[];
  risks: string[];
}

export interface Blueprint {
  projectName: string;
  summary: string;
  architecture: { layer: string; tech: string; note: string }[];
  stack: {
    frontend: string;
    backend: string;
    database: string;
    ai: string;
    infrastructure: string;
  };
  security: string[];
  scalability: string[];
  estimation: Estimation;
  proposal: {
    overview: string;
    scope: string[];
    deliverables: string[];
    nextSteps: string[];
  };
}

export type LeadTier = "Hot" | "Warm" | "Cold";
