import { AGENT_DEFINITIONS } from "@/lib/constants";
import type { AgentId, AgentResponse, OutputSection } from "@/lib/types";
import { compactText } from "@/lib/utils";

const PROMPT_PLACEHOLDERS: Record<AgentId, string> = {
  ops: "You are the Ironclad Ops Agent. Diagnose scheduling, crew, dispatch, and service-delivery issues for small trade businesses. Output clear priorities, practical next steps, and a short owner talk track.",
  sales:
    "You are the Ironclad Sales Agent. Help trade businesses recover leads, tighten follow-up, and increase close rate using simple scripts, timelines, and offer framing.",
  marketing:
    "You are the Ironclad Marketing Agent. Turn trade-business problems into simple campaigns with an offer, channel plan, message angle, and next-seven-day execution list.",
  growth:
    "You are the Ironclad Growth Agent. Identify the most leveraged growth move for a small trade business and explain what to measure, what to test, and what to stop doing.",
};

function detectTradeContext(scenario: string) {
  if (/(pipe|drain|plumb|leak|repipe|water heater)/i.test(scenario)) {
    return "Plumbing business";
  }

  if (/(hvac|furnace|ac|cooling|heating|tune-up)/i.test(scenario)) {
    return "HVAC business";
  }

  if (/(panel|electrical|breaker|rewire|generator)/i.test(scenario)) {
    return "Electrical business";
  }

  return "Trade service business";
}

function detectUrgency(scenario: string): AgentResponse["urgency"] {
  if (/(urgent|angry|late|behind|missed|cooling off|overbooked|upset)/i.test(scenario)) {
    return "High";
  }

  if (/(slow|flat|inconsistent|plateau|shopping|soft)/i.test(scenario)) {
    return "Medium";
  }

  return "Low";
}

function getAgentLabel(agent: AgentId) {
  return AGENT_DEFINITIONS.find((item) => item.id === agent)?.panelLabel ?? "Agent";
}

function baseSections(scenario: string) {
  return [
    `Scenario received: "${compactText(scenario)}"`,
    "Keep recommendations operator-friendly, fast to scan, and realistic for a small local team.",
  ];
}

function buildOpsSections(scenario: string, tradeContext: string): OutputSection[] {
  return [
    {
      title: "Situation Scan",
      bullets: [
        ...baseSections(scenario),
        `${tradeContext} is showing a same-day capacity and communication issue.`,
      ],
    },
    {
      title: "Likely Root Causes",
      bullets: [
        "Dispatch does not have a clear red-yellow-green board for jobs that can move versus jobs that must stay.",
        "Customer communication is probably happening too late, which turns a schedule problem into a trust problem.",
        "Crew coverage is being solved reactively instead of with a same-day triage playbook.",
      ],
    },
    {
      title: "48-Hour Action Plan",
      bullets: [
        "Re-rank every active job by urgency, revenue risk, and callback risk before the next dispatch cycle.",
        "Call delayed customers with a firm revised window and a short make-good option before they call first.",
        "Protect one dispatcher or owner from field interruptions so they can run the board cleanly for the rest of the day.",
        "End the day by capturing what slipped, why it slipped, and which job types need overflow coverage.",
      ],
    },
    {
      title: "Owner Talk Track",
      bullets: [
        "Tell the team: today is about board control, proactive customer calls, and finishing the highest-risk jobs cleanly.",
      ],
    },
  ];
}

function buildSalesSections(scenario: string, tradeContext: string): OutputSection[] {
  return [
    {
      title: "Lead Snapshot",
      bullets: [
        ...baseSections(scenario),
        `${tradeContext} needs a faster, more confident speed-to-lead motion.`,
      ],
    },
    {
      title: "Immediate Response",
      bullets: [
        "Reach out by phone first, then send a short text recap with a direct booking path.",
        "Acknowledge the delay without overexplaining, then pivot into clarity and confidence.",
        "Offer a specific next step within the next business block: call, estimate slot, or visit window.",
      ],
    },
    {
      title: "Talk Track",
      bullets: [
        "Lead with: we reviewed your request, we can help, and here is the cleanest next step to get your quote moving today.",
        "Frame expertise around safety, timeline, and homeowner peace of mind instead of generic discounting.",
      ],
    },
    {
      title: "Follow-Up Cadence",
      bullets: [
        "Same day: call plus text.",
        "Next morning: one proof-driven follow-up with a scheduling option.",
        "48 hours later: final nudge tied to urgency, availability, or seasonal timing.",
      ],
    },
  ];
}

function buildMarketingSections(scenario: string, tradeContext: string): OutputSection[] {
  return [
    {
      title: "Campaign Angle",
      bullets: [
        ...baseSections(scenario),
        `Anchor the message around one practical promise that fits a ${tradeContext.toLowerCase()}.`,
      ],
    },
    {
      title: "Offer Strategy",
      bullets: [
        "Package the offer around reduced risk or convenience instead of a race to the bottom on price.",
        "Use seasonal timing, limited crew availability, or preventive savings as the reason to act now.",
      ],
    },
    {
      title: "Channel Mix",
      bullets: [
        "Email existing customers first because it is the fastest low-cost win.",
        "Run one local social post and one short paid test instead of spreading budget across too many channels.",
        "Give technicians a one-line in-home mention so the campaign is reinforced in the field.",
      ],
    },
    {
      title: "Next 7 Days",
      bullets: [
        "Finalize the offer and one headline today.",
        "Launch email and social tomorrow.",
        "Review call volume, booked jobs, and close rate after three business days.",
      ],
    },
  ];
}

function buildGrowthSections(scenario: string, tradeContext: string): OutputSection[] {
  return [
    {
      title: "Growth Diagnosis",
      bullets: [
        ...baseSections(scenario),
        `${tradeContext} does not need more ideas right now; it needs one chosen growth lever and weekly measurement discipline.`,
      ],
    },
    {
      title: "Primary Bottleneck",
      bullets: [
        "The business likely has uneven demand capture rather than zero demand.",
        "Follow-up, referral activation, and operational consistency are probably leaking more revenue than top-of-funnel visibility alone.",
      ],
    },
    {
      title: "Best Next Move",
      bullets: [
        "Pick one revenue lever for 30 days: referral activation, faster lead recovery, or one focused seasonal offer.",
        "Tie that lever to a weekly scoreboard with only three numbers: leads, booked work, and average ticket or close rate.",
      ],
    },
    {
      title: "Metrics To Watch",
      bullets: [
        "Lead response time",
        "Booked-job conversion rate",
        "Repeat and referral revenue share",
      ],
    },
  ];
}

export function buildMockResponse(agent: AgentId, scenario: string): AgentResponse {
  const tradeContext = detectTradeContext(scenario);
  const urgency = detectUrgency(scenario);

  const responseMap: Record<
    AgentId,
    Omit<
      AgentResponse,
      "agent" | "agentLabel" | "tradeContext" | "urgency" | "promptPlaceholder"
    >
  > = {
    ops: {
      title: "Ops Stabilization Plan",
      subtitle: "Regain board control, protect customer trust, and reduce crew chaos.",
      summary:
        "This is an execution problem first. Stabilize dispatch, communicate earlier, and protect the highest-risk jobs before trying to optimize the rest.",
      sections: buildOpsSections(scenario, tradeContext),
      quickActions: [
        "Re-rank today's jobs by urgency and callback risk.",
        "Call delayed customers before the next dispatch wave.",
        "Assign one person to board control for the rest of the day.",
      ],
    },
    sales: {
      title: "Lead Recovery Playbook",
      subtitle: "Win back urgency, credibility, and a clean next step to close.",
      summary:
        "The lead is still workable if the business responds with speed, clarity, and a low-friction next action instead of a generic quote email.",
      sections: buildSalesSections(scenario, tradeContext),
      quickActions: [
        "Call now, then text a short recap.",
        "Offer one concrete next step in the next business block.",
        "Follow up with proof and urgency, not a discount-first message.",
      ],
    },
    marketing: {
      title: "Campaign Draft",
      subtitle: "Turn the business problem into one clear, launchable message.",
      summary:
        "The fastest demo-ready marketing move is a simple offer with one promise, one audience, and one short launch window.",
      sections: buildMarketingSections(scenario, tradeContext),
      quickActions: [
        "Choose one promise and one audience.",
        "Write one email and one local social post.",
        "Measure booked jobs before expanding spend.",
      ],
    },
    growth: {
      title: "Growth Priority Brief",
      subtitle: "Choose one lever, measure it weekly, and stop diluting effort.",
      summary:
        "Growth will come from picking a single lever and operating it tightly for 30 days, not from running three half-built initiatives at once.",
      sections: buildGrowthSections(scenario, tradeContext),
      quickActions: [
        "Choose one growth lever for the next 30 days.",
        "Track three numbers weekly and review them on one cadence.",
        "Cut any experiment that does not support the chosen lever.",
      ],
    },
  };

  return {
    agent,
    agentLabel: getAgentLabel(agent),
    tradeContext,
    urgency,
    promptPlaceholder: PROMPT_PLACEHOLDERS[agent],
    ...responseMap[agent],
  };
}
