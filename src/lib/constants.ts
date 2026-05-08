import type {
  AgentId,
  BusinessSize,
  BusinessSizeDefinition,
  ProblemDefinition,
  ProblemId,
  TradeDefinition,
  TradeId,
} from "@/lib/types";

export const TRADE_DEFINITIONS: TradeDefinition[] = [
  {
    id: "plumbing",
    label: "Plumbing",
    tag: "Emergency Dispatch",
    focus: "Leaks, clogs, water heaters, after-hours calls",
  },
  {
    id: "hvac",
    label: "HVAC",
    tag: "Seasonal Urgency",
    focus: "No-cool, no-heat, maintenance plans, peak-season triage",
  },
  {
    id: "electrical",
    label: "Electrical",
    tag: "Trust + Safety",
    focus: "Panel work, scheduling clarity, quote confidence, homeowner trust",
  },
  {
    id: "roofing",
    label: "Roofing",
    tag: "Storm Leads",
    focus: "Storm calls, inspection requests, estimate follow-up, lead speed",
  },
  {
    id: "cleaning",
    label: "Cleaning",
    tag: "Recurring Service",
    focus: "Recurring follow-up, quote requests, reminders, review loops",
  },
  {
    id: "landscaping",
    label: "Landscaping",
    tag: "Seasonal Demand",
    focus: "Seasonal quote follow-up, repeat service reminders, route timing",
  },
];

const TRADE_DEFINITION_MAP = Object.fromEntries(
  TRADE_DEFINITIONS.map((trade) => [trade.id, trade]),
) as Record<TradeId, TradeDefinition>;

export const DEFAULT_TRADE_ID: TradeId = "plumbing";

export const BUSINESS_SIZE_OPTIONS: BusinessSizeDefinition[] = [
  {
    id: "solo",
    label: "Solo owner",
    description: "Owner handles calls, quotes, and most of the work.",
  },
  {
    id: "small_team",
    label: "Small team",
    description: "A few field people, with calls split between owner and office.",
  },
  {
    id: "multi_crew",
    label: "Multi-crew",
    description: "Several crews or routes with more handoffs to keep organized.",
  },
  {
    id: "office_plus_field",
    label: "Office + field",
    description: "Office staff handles intake while field teams handle service.",
  },
];

const BUSINESS_SIZE_MAP = Object.fromEntries(
  BUSINESS_SIZE_OPTIONS.map((size) => [size.id, size]),
) as Record<BusinessSize, BusinessSizeDefinition>;

export const DEFAULT_BUSINESS_SIZE: BusinessSize = "small_team";

export const DEFAULT_DIAGNOSTIC_GOAL =
  "Book more jobs from the calls and leads we already get.";

export const PROBLEM_DEFINITIONS: ProblemDefinition[] = [
  {
    id: "missed_calls",
    label: "Missed Call Recovery Audit",
    tag: "Lead Recovery",
    summary:
      "Audit how your shop handles missed calls, web leads, and callback follow-up before more booked jobs leak out.",
    focus:
      "Missed calls, text-back speed, office ownership, estimate follow-up, and after-hours leakage",
    outcome:
      "Revenue leak map, first-fix action plan, text-back workflow, and follow-up sequence",
    mappedAgent: "sales",
    defaultScenario:
      "We run a plumbing company. When a call is missed, nobody texts back right away. Website leads sometimes sit until the next morning, and we do not have a clear follow-up process.",
    responseTitle: "Missed Call Recovery + Lead Follow-Up Audit",
    responseSubtitle:
      "See where leads are leaking, what to fix first, and what Ironclad Ops can install.",
    implementationOffer: {
      title: "What Ironclad Ops can build for you",
      body:
        "Ironclad Ops can set up the call routing, missed-call text-back, lead board, follow-up sequence, and after-hours handoff so missed opportunities stop slipping through the cracks.",
      cta: "Get build help",
    },
  },
  {
    id: "no_lead_follow_up",
    label: "Lead Follow-Up Audit",
    tag: "Follow-Up",
    summary: "Spot where estimate requests and form fills go cold after first contact.",
    focus: "Response times, call attempts, text cadence, lead ownership",
    outcome: "Follow-up audit, messaging sequence, and owner handoff rules",
    mappedAgent: "sales",
    defaultScenario:
      "New estimate requests come in from the website, but nobody texts or calls back until the next day.",
    responseTitle: "Lead Follow-Up Audit",
    responseSubtitle: "Find where warm leads stall after first contact and what to fix first.",
    implementationOffer: {
      title: "What Ironclad Ops can build for you",
      body:
        "Ironclad Ops can install the response workflow, message templates, reminders, and lead board so every new inquiry gets touched fast.",
      cta: "Get build help",
    },
  },
  {
    id: "low_google_reviews",
    label: "Low Google Reviews",
    tag: "Reputation",
    summary: "Turn happy customers into proof that helps the next customer call.",
    focus: "Review asks, technician timing, Google trust",
    outcome: "Ask script, timing plan, reputation lift moves",
    mappedAgent: "marketing",
    defaultScenario:
      "Customers tell us we did a great job, but we barely ask for reviews and our Google profile looks weak.",
    responseTitle: "Google Review Lift Plan",
    responseSubtitle: "Build trust and proof without begging for reviews.",
    implementationOffer: {
      title: "Want your review system built out for the field team?",
      body:
        "Ironclad Ops can install the ask workflow, staff prompts, and follow-up sequence so reviews grow consistently.",
      cta: "Talk through the setup",
    },
  },
  {
    id: "slow_quoting",
    label: "Slow Quoting",
    tag: "Quote Speed",
    summary: "Get estimates out faster so price conversations do not lose momentum.",
    focus: "Estimate turnaround, quote templates, close rate",
    outcome: "Fast quote workflow, message template, margin guardrails",
    mappedAgent: "sales",
    defaultScenario:
      "Customers ask for a quote, but it takes us too long to send pricing and we lose momentum.",
    responseTitle: "Fast Quote Conversion Plan",
    responseSubtitle: "Move from slow estimates to cleaner closes.",
    implementationOffer: {
      title: "Want quoting tightened up across the whole shop?",
      body:
        "Ironclad Ops can build the quote workflow, message templates, and approval rules that cut lag without killing margin.",
      cta: "Map the rollout",
    },
  },
  {
    id: "no_online_booking",
    label: "No Online Booking",
    tag: "Booking Flow",
    summary: "Give customers a simple way to book without waiting for office hours.",
    focus: "Booking friction, intake fields, scheduling handoff",
    outcome: "Booking flow fix, web offer, no-show guardrails",
    mappedAgent: "ops",
    defaultScenario:
      "People want to book service online, but our site only has a basic contact form and leads drop off.",
    responseTitle: "Online Booking Activation Plan",
    responseSubtitle: "Make it easy to book without adding scheduling chaos.",
    implementationOffer: {
      title: "Need online booking wired into the real operation?",
      body:
        "Ironclad Ops can map the intake flow, handoff rules, and schedule protections so online booking actually works for the team.",
      cta: "Review the booking setup",
    },
  },
  {
    id: "weak_website_conversion",
    label: "Weak Website Conversion",
    tag: "Website Conversion",
    summary: "Turn more site visits into calls, form fills, and booked jobs.",
    focus: "CTA clarity, trust signals, conversion friction",
    outcome: "Above-the-fold fix, CTA rewrite, trust layer additions",
    mappedAgent: "growth",
    defaultScenario:
      "We get some website traffic, but too few visitors call, fill out the form, or book service.",
    responseTitle: "Website Conversion Repair Plan",
    responseSubtitle: "Patch the trust and CTA leaks that keep visitors from contacting you.",
    implementationOffer: {
      title: "Want this built instead of sitting in a notes app?",
      body:
        "Ironclad Ops can turn the conversion fixes into live site copy, trust blocks, and booking flows your business can use right away.",
      cta: "Scope the website fix",
    },
  },
];

const PROBLEM_DEFINITION_MAP = Object.fromEntries(
  PROBLEM_DEFINITIONS.map((problem) => [problem.id, problem]),
) as Record<ProblemId, ProblemDefinition>;

export const DEFAULT_PROBLEM_ID: ProblemId = "missed_calls";

export const LEGACY_AGENT_PROBLEM_MAP: Record<AgentId, ProblemId> = {
  ops: "missed_calls",
  sales: "missed_calls",
  marketing: "missed_calls",
  growth: "missed_calls",
};

export const TRADE_FALLBACK_SCENARIOS: Record<TradeId, string> = {
  plumbing:
    "We run a plumbing company. When a call is missed, nobody texts back right away. Website leads sometimes sit until the next morning, and we do not have a clear follow-up process.",
  hvac:
    "We run an HVAC company. During hot weeks, no-cool calls pile up, and if we miss one, nobody is texting back fast or triaging the lead well.",
  electrical:
    "We run an electrical company. Quote requests and callback requests come in, but scheduling is unclear and nobody owns the follow-up once the office gets busy.",
  roofing:
    "We run a roofing company. Storm leads come in fast, but if we miss the first call or inspection request, the follow-up is too slow and the lead moves on.",
  cleaning:
    "We run a cleaning company. Quote requests come in, but if someone does not book right away, nobody follows up with a second text or call.",
  landscaping:
    "We run a landscaping company. Seasonal estimate requests come in, but missed calls and form fills are not getting a fast text-back or a clean follow-up sequence.",
};

export function getProblemDefinition(problemId: ProblemId) {
  return PROBLEM_DEFINITION_MAP[problemId];
}

export function getProblemAgent(problemId: ProblemId) {
  return getProblemDefinition(problemId).mappedAgent;
}

export function getProblemFromLegacyAgent(agent: AgentId) {
  return LEGACY_AGENT_PROBLEM_MAP[agent];
}

export function getTradeDefinition(tradeId: TradeId) {
  return TRADE_DEFINITION_MAP[tradeId];
}

export function getTradeFallbackScenario(tradeId: TradeId) {
  return TRADE_FALLBACK_SCENARIOS[tradeId];
}

export function getBusinessSizeDefinition(businessSize: BusinessSize) {
  return BUSINESS_SIZE_MAP[businessSize];
}
