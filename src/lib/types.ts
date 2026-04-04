export type AgentId = "ops" | "sales" | "marketing" | "growth";

export type AgentDefinition = {
  id: AgentId;
  buttonLabel: string;
  panelLabel: string;
  summary: string;
  focus: string;
  outcome: string;
};

export type ScenarioPreset = {
  label: string;
  value: string;
};

export type OutputSection = {
  title: string;
  description?: string;
  format?: "bullets" | "text";
  bullets?: string[];
  body?: string;
};

export type ResponseHighlight = {
  label: string;
  value: string;
};

export type AgentResponse = {
  agent: AgentId;
  agentLabel: string;
  mode: "live" | "demo";
  modeLabel: string;
  title: string;
  subtitle: string;
  tradeContext: string;
  urgency: "Low" | "Medium" | "High";
  summary: string;
  highlights: ResponseHighlight[];
  sections: OutputSection[];
  quickActions: string[];
  promptPlaceholder: string;
};

export type DemoStep = {
  id: string;
  title: string;
  note: string;
  agent: AgentId;
  scenario: string;
};
