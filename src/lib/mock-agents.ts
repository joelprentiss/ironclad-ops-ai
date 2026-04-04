import type { AgentId, AgentResponse, OutputSection, ResponseHighlight } from "@/lib/types";
import { compactText } from "@/lib/utils";

const PROMPT_PLACEHOLDERS: Record<AgentId, string> = {
  ops: "You are the Ironclad Ops Agent. Diagnose service-delivery issues for small trade businesses, then return the root cause, immediate fix, SOP, and efficiency improvements in operator-ready language.",
  sales:
    "You are the Ironclad Sales Agent. Turn a trade-business lead into a cleaner close motion with a quote message, text follow-up, objection handling, and a relevant upsell.",
  marketing:
    "You are the Ironclad Marketing Agent. Create practical local marketing assets for trade businesses, including a social post, short-form video concept, review response, and SEO topic.",
  growth:
    "You are the Ironclad Growth Agent. Help a trade-business owner choose the next scaling move using pricing, hiring, margin improvement, and operational leverage.",
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

  if (/solo|working solo|owner-operator/i.test(scenario)) {
    return "Owner-operator trade business";
  }

  return "Trade service business";
}

function detectUrgency(scenario: string): AgentResponse["urgency"] {
  if (/(late|complaining|urgent|angry|behind|missed|cooling off|overbooked)/i.test(scenario)) {
    return "High";
  }

  if (/(quote|attract|content|solo|what's next|growth)/i.test(scenario)) {
    return "Medium";
  }

  return "Low";
}

function detectServiceFocus(scenario: string) {
  if (/water heater/i.test(scenario)) {
    return "water heater installation";
  }

  if (/plumb/i.test(scenario)) {
    return "plumbing service";
  }

  if (/hvac|heating|cooling/i.test(scenario)) {
    return "HVAC service";
  }

  if (/electrical|panel|breaker/i.test(scenario)) {
    return "electrical service";
  }

  return "service work";
}

function buildOpsResponse(
  scenario: string,
  tradeContext: string,
  urgency: AgentResponse["urgency"],
): AgentResponse {
  const sections: OutputSection[] = [
    {
      title: "Root Cause Analysis",
      description: "Why the business is feeling late and chaotic right now.",
      bullets: [
        `${tradeContext} is running with weak board discipline, so jobs are slipping before anyone actively re-sequences the day.`,
        "Customers are probably hearing about delays too late, which turns a schedule problem into a trust problem.",
        "Tech routes and promised arrival windows are not being protected by a simple dispatch triage rule.",
        `Scenario in plain language: "${compactText(scenario)}"`,
      ],
    },
    {
      title: "Immediate Fix",
      description: "The same-day move to stop the bleeding.",
      bullets: [
        "Freeze new non-urgent work for the next dispatch block and re-rank every active job by urgency, revenue risk, and callback risk.",
        "Call affected customers before they call first and give a firm revised window plus a make-good note if needed.",
        "Assign one person to board control so field updates are not getting lost between office chatter and job changes.",
      ],
    },
    {
      title: "Dispatch SOP",
      description: "A lightweight repeatable process for every service day.",
      bullets: [
        "7:00 AM: review jobs by promise window, travel time, and technician fit before trucks roll.",
        "10:30 AM: run a board check for any job that is drifting more than 20 minutes behind plan.",
        "2:00 PM: escalate unfinished high-risk jobs and proactively reset low-priority appointments.",
        "End of day: capture late-job reasons so repeat failure patterns become visible within one week.",
      ],
    },
    {
      title: "Efficiency Improvements",
      description: "Small systems that reduce chaos without adding software complexity.",
      bullets: [
        "Standardize job tags: must-hold, flex, callback risk, and upsell opportunity.",
        "Track only three operating numbers at first: late arrivals, average jobs per tech, and same-day callbacks.",
        "Use one arrival-window script so every delayed customer hears the same high-trust message.",
      ],
    },
  ];

  const highlights: ResponseHighlight[] = [
    { label: "Priority", value: "Board control first" },
    { label: "Risk", value: "Customer trust erosion" },
    { label: "Best next move", value: "Dispatch triage SOP" },
  ];

  return {
    agent: "ops",
    agentLabel: "Ops Agent",
    title: "Ops Recovery Blueprint",
    subtitle: "Stop the drift, protect customer trust, and tighten the daily board.",
    tradeContext,
    urgency,
    summary:
      "This is not a labor problem first. It is a sequencing and communication problem. Fix the board, communicate earlier, and standardize the daily triage routine.",
    highlights,
    sections,
    quickActions: [
      "Re-rank today's schedule.",
      "Call delayed customers before the next dispatch wave.",
      "Install the daily late-job SOP for one week.",
    ],
    promptPlaceholder: PROMPT_PLACEHOLDERS.ops,
  };
}

function buildSalesResponse(
  scenario: string,
  tradeContext: string,
  urgency: AgentResponse["urgency"],
): AgentResponse {
  const serviceFocus = detectServiceFocus(scenario);

  const sections: OutputSection[] = [
    {
      title: "Quote Message",
      format: "text",
      description: "Use this as the email or text summary right after first contact.",
      body: `Hi [Customer Name],\n\nThanks for reaching out about your ${serviceFocus}. We can help with that. Based on what you shared, the next best step is a quick assessment so we can give you a clean quote with the right scope, timeline, and total price.\n\nWe have availability [today/tomorrow] and can get this moving without dragging it out. If you want, I can lock in a time now.\n\n- [Your Name]\nIronclad Demo Plumbing`,
    },
    {
      title: "SMS Follow-Up",
      format: "text",
      description: "Short, direct, and easy for the customer to answer.",
      body: `Hi [Customer Name], this is [Your Name] with Ironclad. We can quote the ${serviceFocus} and get you a clear next step today. Want me to text over two time options?`,
    },
    {
      title: "Objection Handling",
      description: "Keep the conversation anchored in clarity and trust.",
      bullets: [
        "If they say they are shopping: respond with scope clarity, timeline confidence, and what is included in the quote.",
        "If they say price matters most: explain the difference between a cheap install and a complete install done without callbacks.",
        "If they delay: offer a simple hold option for the estimate slot instead of pushing hard.",
      ],
    },
    {
      title: "Upsell Opportunity",
      description: "Attach something useful that fits the service naturally.",
      bullets: [
        "Offer haul-away, code update review, or shutoff valve replacement alongside the install.",
        "Position the add-on as preventing a second visit later, not as a random upsell.",
        `${tradeContext} can also attach a maintenance reminder or annual inspection option to improve lifetime value.`,
      ],
    },
  ];

  const highlights: ResponseHighlight[] = [
    { label: "Lead type", value: serviceFocus },
    { label: "Conversion move", value: "Call plus text recap" },
    { label: "Extra revenue", value: "Attach a service add-on" },
  ];

  return {
    agent: "sales",
    agentLabel: "Sales Agent",
    title: "Lead Conversion Pack",
    subtitle: "Turn a raw inquiry into a booked estimate and a stronger ticket.",
    tradeContext,
    urgency,
    summary:
      "The goal is not to send a generic quote. The goal is to shorten the gap between inquiry and booked next step while sounding confident, local, and easy to work with.",
    highlights,
    sections,
    quickActions: [
      "Call first, then send the recap text.",
      "Offer two scheduling options instead of asking an open question.",
      "Attach one relevant upsell to the estimate conversation.",
    ],
    promptPlaceholder: PROMPT_PLACEHOLDERS.sales,
  };
}

function buildMarketingResponse(
  scenario: string,
  tradeContext: string,
  urgency: AgentResponse["urgency"],
): AgentResponse {
  const sections: OutputSection[] = [
    {
      title: "Social Post",
      format: "text",
      description: "A local-feeling post built for trust, not fluff.",
      body: `Local homeowners do not need more guesswork when a plumbing issue hits. They need a crew that shows up, explains the problem clearly, and fixes it right the first time.\n\nIf you need plumbing help in [City], send us a message and we will point you to the fastest next step.\n\n#Plumbing #LocalService #HomeMaintenance`,
    },
    {
      title: "Short-Form Video Idea",
      description: "Simple enough to shoot on a phone in one afternoon.",
      bullets: [
        "Hook: show the most common homeowner plumbing problem you see in under five seconds.",
        "Middle: explain one mistake people make before calling a pro.",
        "Close: give one practical tip and end with a local call to action.",
      ],
    },
    {
      title: "Review Response",
      format: "text",
      description: "Use this as the baseline reply to positive customer reviews.",
      body: `Thank you for trusting us with your plumbing work. We know homeowners want clear communication, clean work, and no surprises, so it means a lot to hear that came through. We appreciate the review and are here whenever you need us again.`,
    },
    {
      title: "SEO Topic",
      description: "One topic that matches local intent and sales readiness.",
      bullets: [
        "Primary topic: How to know when a water heater repair is no longer worth it.",
        "Angle: local homeowner advice written by a real service company.",
        `Why it works: it attracts intent-driven searchers and fits a ${tradeContext.toLowerCase()} without sounding generic.`,
      ],
    },
  ];

  const highlights: ResponseHighlight[] = [
    { label: "Campaign lane", value: "Local trust content" },
    { label: "Fastest asset", value: "One post plus one phone video" },
    { label: "Search angle", value: "Problem-led homeowner topic" },
  ];

  return {
    agent: "marketing",
    agentLabel: "Marketing Agent",
    title: "Local Marketing Kit",
    subtitle: "Build visibility with assets a small service business can actually ship.",
    tradeContext,
    urgency,
    summary:
      "The smartest early marketing move is not more channels. It is better trust-building content published consistently enough to make the business look real, local, and easy to call.",
    highlights,
    sections,
    quickActions: [
      "Publish the social post this week.",
      "Record the short-form video on a real job day.",
      "Turn the SEO topic into one local landing article.",
    ],
    promptPlaceholder: PROMPT_PLACEHOLDERS.marketing,
  };
}

function buildGrowthResponse(
  scenario: string,
  tradeContext: string,
  urgency: AgentResponse["urgency"],
): AgentResponse {
  const sections: OutputSection[] = [
    {
      title: "Pricing Improvement",
      description: "Make revenue per job stronger before adding complexity.",
      bullets: [
        "Raise prices selectively on the jobs that already close easily and create the most stress.",
        "Package work into clearer options so customers compare levels of service instead of only comparing price.",
        "Track average ticket weekly to confirm the price move is improving margin, not just top-line revenue.",
      ],
    },
    {
      title: "Hiring Guidance",
      description: "Do not hire based on exhaustion alone. Hire against the constraint.",
      bullets: [
        "If admin work is slowing follow-up, hire part-time office support before a second truck.",
        "If jobs are there and close rate is solid, the first field hire should increase capacity without lowering standards.",
        "Create one simple handoff checklist before hiring so the owner is not training from memory every time.",
      ],
    },
    {
      title: "Revenue Optimization",
      description: "Pull more value from work you already touch.",
      bullets: [
        "Shorten lead response time and estimate lag before spending more on marketing.",
        "Add one consistent service add-on or maintenance offer to increase lifetime value.",
        "Review which job types create the best margin and least chaos, then bias the mix toward those jobs.",
      ],
    },
    {
      title: "Scaling Move",
      description: "The next step is a tighter machine, not just more hustle.",
      bullets: [
        "Move from solo operator to owner-operator with one defined system for sales, scheduling, and follow-up.",
        "Set a 90-day target: higher average ticket, faster lead response, and one support hire or subcontract lane.",
        `For a ${tradeContext.toLowerCase()}, the next real level-up is building repeatable systems before chasing a larger footprint.`,
      ],
    },
  ];

  const highlights: ResponseHighlight[] = [
    { label: "Best lever", value: "Raise ticket quality" },
    { label: "First hire", value: "Admin or capacity constraint" },
    { label: "Scale path", value: "Systemize before expanding" },
  ];

  return {
    agent: "growth",
    agentLabel: "Growth Agent",
    title: "Owner Growth Brief",
    subtitle: "Turn solo income into a business that can actually scale.",
    tradeContext,
    urgency,
    summary:
      "The next move is not simply working harder. It is tightening pricing, removing the first constraint, and turning owner knowledge into repeatable systems that someone else can run.",
    highlights,
    sections,
    quickActions: [
      "Review prices and margin by job type.",
      "Choose the first constraint to hire against.",
      "Build one repeatable system each for lead follow-up and scheduling.",
    ],
    promptPlaceholder: PROMPT_PLACEHOLDERS.growth,
  };
}

export function buildMockResponse(agent: AgentId, scenario: string): AgentResponse {
  const tradeContext = detectTradeContext(scenario);
  const urgency = detectUrgency(scenario);

  switch (agent) {
    case "ops":
      return buildOpsResponse(scenario, tradeContext, urgency);
    case "sales":
      return buildSalesResponse(scenario, tradeContext, urgency);
    case "marketing":
      return buildMarketingResponse(scenario, tradeContext, urgency);
    case "growth":
      return buildGrowthResponse(scenario, tradeContext, urgency);
    default:
      return buildOpsResponse(scenario, tradeContext, urgency);
  }
}
