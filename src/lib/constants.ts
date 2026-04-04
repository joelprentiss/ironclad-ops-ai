import type { AgentDefinition, AgentId, ScenarioPreset } from "@/lib/types";

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: "ops",
    buttonLabel: "Analyze Ops",
    panelLabel: "Ops Agent",
    summary: "Stabilize crew, schedule, dispatch, and delivery risk.",
    focus: "Throughput, bottlenecks, customer friction",
    outcome: "Root cause, same-day fix, SOP, efficiency gains",
  },
  {
    id: "sales",
    buttonLabel: "Handle Lead",
    panelLabel: "Sales Agent",
    summary: "Tighten lead response, quoting, and follow-up execution.",
    focus: "Speed-to-lead, scripts, conversion next steps",
    outcome: "Quote draft, SMS follow-up, objection handling, upsell",
  },
  {
    id: "marketing",
    buttonLabel: "Create Marketing",
    panelLabel: "Marketing Agent",
    summary: "Turn a business challenge into a simple campaign angle.",
    focus: "Offer, channel mix, message clarity",
    outcome: "Social post, short-form video, review response, SEO topic",
  },
  {
    id: "growth",
    buttonLabel: "Growth Insights",
    panelLabel: "Growth Agent",
    summary: "Spot the highest-leverage growth move for the next 30 days.",
    focus: "Revenue levers, metrics, experiments",
    outcome: "Pricing move, hiring guidance, revenue optimization, scale path",
  },
];

export const DEFAULT_SCENARIO =
  "I run a plumbing business. Jobs are always late and customers are complaining.";

export const STARTER_SCENARIOS: ScenarioPreset[] = [
  {
    label: "Late Jobs",
    value: "I run a plumbing business. Jobs are always late and customers are complaining.",
  },
  {
    label: "Water Heater Quote",
    value: "Customer needs water heater installation. Wants a quote.",
  },
  {
    label: "Plumbing Marketing",
    value: "Create content to attract more local plumbing customers.",
  },
  {
    label: "Solo Owner Growth",
    value: "I'm making $120k/year working solo. What's next?",
  },
];

export const EMPTY_AGENT_SCENARIOS: Record<AgentId, string> = {
  ops: "I run a plumbing business. Jobs are always late and customers are complaining.",
  sales: "Customer needs water heater installation. Wants a quote.",
  marketing: "Create content to attract more local plumbing customers.",
  growth: "I'm making $120k/year working solo. What's next?",
};
