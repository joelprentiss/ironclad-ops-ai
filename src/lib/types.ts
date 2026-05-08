export type AgentId = "ops" | "sales" | "marketing" | "growth";

export type TradeId =
  | "plumbing"
  | "hvac"
  | "electrical"
  | "roofing"
  | "cleaning"
  | "landscaping";

export type TradeDefinition = {
  id: TradeId;
  label: string;
  tag: string;
  focus: string;
};

export type ProblemId =
  | "missed_calls"
  | "no_lead_follow_up"
  | "low_google_reviews"
  | "slow_quoting"
  | "no_online_booking"
  | "weak_website_conversion";

export type BusinessSize =
  | "solo"
  | "small_team"
  | "multi_crew"
  | "office_plus_field";

export type BusinessSizeDefinition = {
  id: BusinessSize;
  label: string;
  description: string;
};

export type LeadCaptureAction =
  | "send_plan"
  | "get_templates"
  | "build_for_me";

export type ContactIntent = LeadCaptureAction | "undecided";

export type BusinessDiagnosticPayload = {
  trade: TradeId;
  problemType: ProblemId;
  businessSize: BusinessSize;
  currentProcess: string;
  goal: string;
  contactIntent?: ContactIntent;
};

export type LegacyDiagnosticPayload = {
  problemId?: string;
  tradeId?: string;
  scenario?: string;
};

export type ServiceOffer = {
  title: string;
  body: string;
  cta: string;
};

export type ProblemDefinition = {
  id: ProblemId;
  label: string;
  tag: string;
  summary: string;
  focus: string;
  outcome: string;
  mappedAgent: AgentId;
  defaultScenario: string;
  responseTitle: string;
  responseSubtitle: string;
  implementationOffer: ServiceOffer;
};

export type ScenarioPreset = {
  label: string;
  value: string;
  problemId?: ProblemId;
  tradeId?: TradeId;
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

export type DiagnosticResponse = {
  problemId: ProblemId;
  problemLabel: string;
  mappedAgent: AgentId;
  tradeId: TradeId;
  tradeLabel: string;
  mode: "live" | "template";
  modeLabel: string;
  title: string;
  subtitle: string;
  tradeContext: string;
  urgency: "Low" | "Medium" | "High";
  summary: string;
  highlights: ResponseHighlight[];
  sections: OutputSection[];
  quickActions: string[];
  implementationOffer: ServiceOffer;
};

export type LeadCapturePayload = {
  action: LeadCaptureAction;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  tradeId: TradeId;
  tradeLabel: string;
  problemId: ProblemId;
  auditTitle: string;
  scenario: string;
  source: "post_audit_cta";
};

export type LeadCaptureResult = {
  status: "received";
  leadId: string;
  action: LeadCaptureAction;
  message: string;
  deliveryMode: "stub";
};
