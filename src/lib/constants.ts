import type { AgentDefinition, ScenarioPreset } from "@/lib/types";

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: "ops",
    buttonLabel: "Analyze Ops",
    panelLabel: "Ops Agent",
    summary: "Stabilize crew, schedule, dispatch, and delivery risk.",
    focus: "Throughput, bottlenecks, customer friction",
  },
  {
    id: "sales",
    buttonLabel: "Handle Lead",
    panelLabel: "Sales Agent",
    summary: "Tighten lead response, quoting, and follow-up execution.",
    focus: "Speed-to-lead, scripts, conversion next steps",
  },
  {
    id: "marketing",
    buttonLabel: "Create Marketing",
    panelLabel: "Marketing Agent",
    summary: "Turn a business challenge into a simple campaign angle.",
    focus: "Offer, channel mix, message clarity",
  },
  {
    id: "growth",
    buttonLabel: "Growth Insights",
    panelLabel: "Growth Agent",
    summary: "Spot the highest-leverage growth move for the next 30 days.",
    focus: "Revenue levers, metrics, experiments",
  },
];

export const DEFAULT_SCENARIO =
  "Two techs called out, dispatch is behind, and three customers are already upset about late arrivals.";

export const STARTER_SCENARIOS: ScenarioPreset[] = [
  {
    label: "Schedule Breakdown",
    value:
      "Two techs called out, dispatch is behind, and three customers are already upset about late arrivals.",
  },
  {
    label: "Hot Lead Going Cold",
    value:
      "A homeowner asked for a quote on a full panel upgrade yesterday, but nobody has followed up and they are now shopping two competitors.",
  },
  {
    label: "Slow Season Push",
    value:
      "Our HVAC installs are slower this month and we need a quick campaign to fill the board without discounting too aggressively.",
  },
  {
    label: "Growth Plateau",
    value:
      "Revenue is flat, referral volume is inconsistent, and we do not know whether to invest next in lead gen, outbound follow-up, or tighter operations.",
  },
];

