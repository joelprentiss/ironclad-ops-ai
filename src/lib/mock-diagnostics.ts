import {
  getBusinessSizeDefinition,
  getProblemAgent,
  getProblemDefinition,
  getTradeDefinition,
} from "@/lib/constants";
import type {
  BusinessDiagnosticPayload,
  DiagnosticResponse,
  OutputSection,
  ProblemId,
  ResponseHighlight,
  TradeId,
} from "@/lib/types";
import { compactText } from "@/lib/utils";

type TradeAuditProfile = {
  context: string;
  likelyLeak: string;
  likelyWeakness: string;
  firstFix: string;
  summaryAngle: string;
  leakBullets: string[];
  textBackMessage: string;
  followUpSequence: string[];
  implementationBullets: string[];
};

const TRADE_AUDIT_PROFILES: Record<TradeId, TradeAuditProfile> = {
  plumbing: {
    context: "Plumbing business",
    likelyLeak: "Emergency-style calls dying after the first miss",
    likelyWeakness: "No after-hours text-back or dispatch owner",
    firstFix: "Acknowledge fast, then route the call by urgency",
    summaryAngle:
      "Plumbing leads often have urgency behind them, so slow acknowledgement feels expensive fast. If emergency-style calls and estimate requests do not get a quick text-back and callback clock, the homeowner usually moves to the next shop.",
    leakBullets: [
      "After-hours leak calls and water heater calls are probably going cold before anyone on the team replies.",
      "Voicemails are likely sitting without a triage rule for emergency, same-day, and estimate-style plumbing calls.",
      "When dispatch gets slammed, missed-call follow-up is probably losing to active jobs already on the board.",
    ],
    textBackMessage:
      "Hi, this is [Name] with [Company]. Sorry we missed your call. If this is an active leak, no-water issue, or water heater problem, text me the issue and your zip code now and I will get you the fastest next step.",
    followUpSequence: [
      "Message 1: Sorry we missed you. Text back the issue, zip code, and whether water is actively leaking.",
      "Message 2: We can either call you back now or send the next available service window.",
      "Message 3: Closing the loop here. If you still need plumbing help, reply YES and we will reopen this.",
    ],
    implementationBullets: [
      "After-hours plumbing acknowledgement and lead routing.",
      "Dispatch-friendly missed-call ownership rules.",
      "A simple callback board for urgent service versus estimate leads.",
      "Text-back templates for emergency and non-emergency plumbing inquiries.",
    ],
  },
  hvac: {
    context: "HVAC business",
    likelyLeak: "No-cool and no-heat leads cooling off in the inbox",
    likelyWeakness: "Weak seasonal lead triage and callback discipline",
    firstFix: "Triage by urgency, then respond with the right service angle",
    summaryAngle:
      "HVAC leads spike around weather swings, so slow callback speed quietly burns the highest-intent opportunities. If no-cool, no-heat, and maintenance-plan inquiries all get treated the same way, the office loses speed and clarity.",
    leakBullets: [
      "No-cool and no-heat inquiries are probably waiting too long for a first human response during peak demand windows.",
      "Website leads for tune-ups, replacements, and repairs may be landing in one queue without urgency tags.",
      "Seasonal rush periods likely create callback slippage because the office is reacting instead of triaging.",
    ],
    textBackMessage:
      "Hi, this is [Name] with [Company]. Sorry we missed your call. If you are dealing with no cooling, no heat, or an urgent system issue, text me the problem and your zip code and I will get you the fastest next step.",
    followUpSequence: [
      "Message 1: Sorry we missed you. Text back no-cool, no-heat, maintenance, or estimate plus your zip code.",
      "Message 2: We can call now or send the next available arrival window for your system issue.",
      "Message 3: Closing this out for now. Reply YES if you still need HVAC help today.",
    ],
    implementationBullets: [
      "Seasonal lead triage and callback priorities.",
      "Service-type tags for repairs, installs, and maintenance-plan opportunities.",
      "Text-back templates for urgent HVAC failures versus standard leads.",
      "A callback workflow that holds up under summer and winter volume spikes.",
    ],
  },
  electrical: {
    context: "Electrical business",
    likelyLeak: "Trust-sensitive leads dropping before the quote conversation starts",
    likelyWeakness: "Slow quoting and unclear scheduling follow-up",
    firstFix: "Respond with trust and clarity, then tighten the callback owner",
    summaryAngle:
      "Electrical customers are usually evaluating trust and safety as much as price. If the callback is slow or vague, the lead does not just cool off, it starts doubting whether the company is organized enough to handle the work safely.",
    leakBullets: [
      "Panel, rewiring, and troubleshooting calls are likely waiting too long for a confident first response.",
      "The follow-up may be too generic, which weakens trust when the customer wants scheduling clarity and proof of professionalism.",
      "Quote requests probably stall because the office does not own the next action once the first callback misses.",
    ],
    textBackMessage:
      "Hi, this is [Name] with [Company]. Sorry we missed your call. I saw your electrical request come through and wanted to reach back quickly. Text me the issue and your zip code and I will send the cleanest next step.",
    followUpSequence: [
      "Message 1: Sorry we missed you. Text back the electrical issue, zip code, and whether it feels urgent.",
      "Message 2: We can call now to confirm scope and the cleanest scheduling option.",
      "Message 3: Closing the loop here. Reply YES if you still want help scheduling the electrical work.",
    ],
    implementationBullets: [
      "Scheduling clarity and callback ownership rules.",
      "Trust-forward text-back templates for homeowner electrical leads.",
      "Quote follow-up sequences for estimates that need more than one touch.",
      "Lead status tracking so nothing vanishes between office and field.",
    ],
  },
  roofing: {
    context: "Roofing business",
    likelyLeak: "Storm and inspection leads slipping during the first response window",
    likelyWeakness: "Slow estimate follow-up after the first inquiry",
    firstFix: "Respond faster on inbound inspection requests and keep the estimate moving",
    summaryAngle:
      "Roofing leads often arrive in bursts after storms or weather events, and the first shop to respond cleanly usually wins the inspection. If those calls and form fills are not getting immediate acknowledgement and estimate follow-up, the conversion loss happens early.",
    leakBullets: [
      "Storm-related inquiries are probably cooling off while the office sorts through inbound volume.",
      "Inspection requests may be getting one touch but not a structured second follow-up after the first miss.",
      "Leads that need an estimate or insurance conversation are likely stalling between intake and the next scheduling step.",
    ],
    textBackMessage:
      "Hi, this is [Name] with [Company]. Sorry we missed your call. If you need a roof inspection, storm response, or estimate, text me your address and a quick note and I will send over the fastest next step.",
    followUpSequence: [
      "Message 1: Sorry we missed you. Text back your address and whether this is storm, leak, repair, or inspection.",
      "Message 2: We can call now or send two inspection windows for the roof issue.",
      "Message 3: Closing this out for now. Reply YES if you still want a roof inspection or estimate.",
    ],
    implementationBullets: [
      "Storm-lead routing and inspection follow-up rules.",
      "Text-back templates for inspections, repairs, and estimate requests.",
      "Estimate follow-up after the first missed callback.",
      "A lead board that helps the office handle burst volume without losing inquiries.",
    ],
  },
  cleaning: {
    context: "Cleaning business",
    likelyLeak: "Quote requests and recurring-service leads fading after the first touch",
    likelyWeakness: "No repeatable sequence for quotes, reminders, and reactivation",
    firstFix: "Tighten first-touch speed and install a cleaner recurring follow-up rhythm",
    summaryAngle:
      "Cleaning leads are often not emergency leads, so they get pushed back when the team is busy. That makes follow-up quality even more important. If quote requests, recurring-service questions, and no-response leads do not have a sequence, the business leaks easy bookings.",
    leakBullets: [
      "Quote requests are probably getting one answer but not a reliable second and third follow-up.",
      "Recurring-service prospects may be slipping because the office is not closing the loop after the first reply.",
      "The team may be relying on memory for reminders and callbacks instead of a visible list.",
    ],
    textBackMessage:
      "Hi, this is [Name] with [Company]. Sorry we missed your message. If you still need cleaning service, text me the home size, zip code, and ideal timing and I will send the fastest next step.",
    followUpSequence: [
      "Message 1: Sorry we missed you. Text back home size, zip code, and whether this is recurring or one-time cleaning.",
      "Message 2: We can send a quote path now or call to confirm timing and scope.",
      "Message 3: Closing the loop here. Reply YES if you still want cleaning availability or pricing.",
    ],
    implementationBullets: [
      "Quote follow-up for recurring and one-time cleaning leads.",
      "Text-back templates for cleaning inquiries.",
      "Reminder timing and reactivation for no-response quotes.",
      "A lead board that fits office-heavy service businesses.",
    ],
  },
  landscaping: {
    context: "Landscaping business",
    likelyLeak: "Seasonal estimate requests dropping between the first touch and the follow-up",
    likelyWeakness: "Weak quote reminders and repeat-service follow-up",
    firstFix: "Respond fast during peak season and install reminder-based follow-up",
    summaryAngle:
      "Landscaping leads often cluster around seasonal demand, and the office can feel busy without being disciplined. If estimate requests, route-based service inquiries, and repeat-service reminders are not structured, good-fit leads fade away quietly.",
    leakBullets: [
      "Seasonal estimate requests are probably waiting too long for the second touch after the first callback misses.",
      "The team may be better at responding to new calls than at following up on unbooked landscape quotes.",
      "Repeat-service opportunities likely need reminders that are not being sent consistently.",
    ],
    textBackMessage:
      "Hi, this is [Name] with [Company]. Sorry we missed your call. If you still need landscaping help, text me the service type, your zip code, and the best callback number and I will send the next step.",
    followUpSequence: [
      "Message 1: Sorry we missed you. Text back the service type, zip code, and whether you need recurring or project work.",
      "Message 2: We can call now or send the next estimate/walkthrough option.",
      "Message 3: Closing this out for now. Reply YES if you still want landscaping help this season.",
    ],
    implementationBullets: [
      "Seasonal callback rules and estimate follow-up.",
      "Service-type tags for recurring work versus project leads.",
      "Reminder-based follow-up for unbooked landscaping estimates.",
      "Simple reporting for callback speed and booked work from new inquiries.",
    ],
  },
};

export function detectTradeContext(scenario: string, tradeId?: TradeId) {
  if (tradeId) {
    return TRADE_AUDIT_PROFILES[tradeId].context;
  }

  if (/(pipe|drain|plumb|leak|repipe|water heater)/i.test(scenario)) {
    return "Plumbing business";
  }

  if (/(hvac|furnace|ac|cooling|heating|tune-up)/i.test(scenario)) {
    return "HVAC business";
  }

  if (/(panel|electrical|breaker|rewire|generator)/i.test(scenario)) {
    return "Electrical business";
  }

  if (/(clean|maid|janitorial|house cleaning)/i.test(scenario)) {
    return "Cleaning business";
  }

  if (/(roof|roofing|shingle|gutter)/i.test(scenario)) {
    return "Roofing business";
  }

  if (/(landscap|lawn|irrigation|yard)/i.test(scenario)) {
    return "Landscaping business";
  }

  return "Trade service business";
}

export function detectUrgency(
  scenario: string,
  tradeId?: TradeId,
): DiagnosticResponse["urgency"] {
  if (
    /(urgent|angry|behind|missed|voicemail|never call back|drop off|slow|lose momentum)/i.test(
      scenario,
    )
  ) {
    return "High";
  }

  if (
    tradeId === "plumbing" && /(leak|burst|water heater|no water|backup)/i.test(scenario)
  ) {
    return "High";
  }

  if (
    tradeId === "hvac" && /(no cool|no cooling|no heat|no heating|broken ac|broken furnace)/i.test(scenario)
  ) {
    return "High";
  }

  if (
    tradeId === "roofing" && /(storm|hail|wind|leak|tarp)/i.test(scenario)
  ) {
    return "High";
  }

  if (
    /(quote|follow-up|estimate|traffic|conversion|recurring|maintenance)/i.test(scenario)
  ) {
    return "Medium";
  }

  return "Low";
}

function buildResponse(
  problemId: ProblemId,
  tradeId: TradeId,
  scenario: string,
  summary: string,
  highlights: ResponseHighlight[],
  sections: OutputSection[],
  quickActions: string[],
): DiagnosticResponse {
  const problem = getProblemDefinition(problemId);
  const trade = getTradeDefinition(tradeId);

  return {
    problemId,
    problemLabel: problem.label,
    mappedAgent: getProblemAgent(problemId),
    tradeId,
    tradeLabel: trade.label,
    mode: "template",
    modeLabel: "Template Mode",
    title: problem.responseTitle,
    subtitle: problem.responseSubtitle,
    tradeContext: detectTradeContext(scenario, tradeId),
    urgency: detectUrgency(scenario, tradeId),
    summary,
    highlights,
    sections,
    quickActions,
    implementationOffer: problem.implementationOffer,
  };
}

function buildScorecard(profile: TradeAuditProfile, payload: BusinessDiagnosticPayload) {
  const businessSize = getBusinessSizeDefinition(payload.businessSize);

  return [
    `Response speed: 4/10 - ${profile.likelyLeak}.`,
    `Lead ownership: 3/10 - ${profile.likelyWeakness}.`,
    `Team fit: ${businessSize.label} - the workflow needs rules a ${businessSize.label.toLowerCase()} can actually run.`,
    `Goal fit: ${payload.goal}`,
  ];
}

function buildQuoteFollowUpTemplate(payload: BusinessDiagnosticPayload) {
  const trade = getTradeDefinition(payload.trade);

  return (
    `Hi [Customer], this is [Name] with [Company]. I wanted to follow up on the ${trade.label.toLowerCase()} quote/request.\n\n` +
    "If you want to move forward, reply YES and I will send the next available [Time Window]. If timing changed, reply LATER and I will check back once more."
  );
}

function buildGenericProblemSections(
  payload: BusinessDiagnosticPayload,
): OutputSection[] {
  const problemId = payload.problemType;
  const tradeId = payload.trade;
  const scenario = payload.currentProcess;
  const trade = getTradeDefinition(tradeId);
  const businessSize = getBusinessSizeDefinition(payload.businessSize);
  const scorecard: OutputSection = {
    title: "Fix This First Scorecard",
    description: "The fastest read on what is broken and where to start.",
    bullets: [
      `Response speed: 5/10 - ${trade.label} leads need a cleaner first touch.`,
      `Ownership: 3/10 - design the handoff for a ${businessSize.label.toLowerCase()} setup.`,
      "Template readiness: 2/10 - the team needs copy-ready messages, not more notes.",
      `Goal fit: ${payload.goal}`,
      `Scenario snapshot: "${compactText(scenario)}"`,
    ],
  };

  const handoff: OutputSection = {
    title: "Ironclad Ops Handoff",
    description: "The workflow pieces that can be installed for the business.",
    bullets: [
      "Lead routing and owner rules.",
      "Text templates and follow-up reminders.",
      "A simple status board for booked, quoted, waiting, and dead leads.",
    ],
  };

  if (problemId === "low_google_reviews") {
    return [
      scorecard,
      {
        title: "Review Request Template",
        description: "Copy-ready review ask for a satisfied customer.",
        format: "text",
        body:
          "Hi [Customer], this is [Name] with [Company]. Thanks again for trusting us with the work today. If the service was handled well, would you leave us a quick Google review? It helps local customers know who they can trust.",
      },
      {
        title: "3-Message Review Follow-Up",
        description: "Three light touches that do not feel pushy.",
        bullets: [
          "Message 1: Thanks again for choosing [Company]. Here is the review link if we earned it: [Review Link].",
          "Message 2: Quick reminder. A short review helps other local customers choose a trusted company.",
          "Message 3: Last reminder from us. Thanks again either way, and call us if anything needs attention.",
        ],
      },
      {
        title: "Best Ask Timing",
        description: "When the team should ask and who should own it.",
        bullets: [
          "Ask after the job is complete and the customer has confirmed they are satisfied.",
          "Have the office send the review link the same day.",
          "Let the technician mention the review, but keep the actual link in a text.",
        ],
      },
      handoff,
    ];
  }

  if (problemId === "slow_quoting") {
    return [
      scorecard,
      {
        title: "Quote Follow-Up Template",
        description: "Copy-ready text for sending or chasing an estimate.",
        format: "text",
        body: buildQuoteFollowUpTemplate(payload),
      },
      {
        title: "3-Message Quote Sequence",
        description: "Three touches that keep the quote moving without sounding desperate.",
        bullets: [
          "Message 1: I sent the quote for [Service]. Reply YES if you want the next available window.",
          "Message 2: Any questions on the quote? I can clarify scope, timing, or next steps.",
          "Message 3: Closing this quote out for now. Reply REOPEN if you still want us to hold a spot.",
        ],
      },
      {
        title: "Quote Routing Rules",
        description: "Simple rules for speed, ownership, and margin protection.",
        bullets: [
          "Send standard quotes same day whenever the scope is clear.",
          "Assign one owner for every quote until booked or closed.",
          "Use approved price ranges so speed does not crush margin.",
        ],
      },
      handoff,
    ];
  }

  if (problemId === "no_online_booking") {
    return [
      scorecard,
      {
        title: "Booking Recommendation",
        description: "The simplest booking flow that fits this business.",
        bullets: [
          `Offer a request-based booking flow before full live scheduling for ${trade.label.toLowerCase()}.`,
          "Ask for service type, zip code, preferred window, and callback number.",
          "Route urgent requests to a callback instead of forcing online booking.",
        ],
      },
      {
        title: "Booking Page Copy",
        description: "Copy-ready website text for the booking action.",
        format: "text",
        body:
          "Request a service window. Tell us what you need, where you are, and the best time to reach you. We will confirm the next available option before anything is locked in.",
      },
      {
        title: "Lead Handoff Rules",
        description: "What happens after the booking request comes in.",
        bullets: [
          "Text back within 5 minutes during business hours.",
          "Tag the request as urgent, standard, estimate, or recurring.",
          "Confirm the window before dispatch or office scheduling moves it forward.",
        ],
      },
      handoff,
    ];
  }

  if (problemId === "weak_website_conversion") {
    return [
      scorecard,
      {
        title: "Above-The-Fold Fix",
        description: "What the first screen should say and show.",
        bullets: [
          `Lead with the exact ${trade.label.toLowerCase()} service area and service types.`,
          "Put call, text, and request buttons above the scroll.",
          "Show proof: reviews, license/trust cues, and recent local work.",
        ],
      },
      {
        title: "CTA Rewrite",
        description: "Copy-ready call-to-action text for calls, forms, or booking.",
        format: "text",
        body:
          "Need [Service] help? Call now or request a callback. Tell us the issue, zip code, and timing, and we will send the fastest next step.",
      },
      {
        title: "Trust Proof Checklist",
        description: "Small proof points that make the next step feel safer.",
        bullets: [
          "Show recent Google review count and rating near the main CTA.",
          "Add service area, license, warranty, or insured language where relevant.",
          "Use real job photos or named service categories instead of vague claims.",
        ],
      },
      handoff,
    ];
  }

  return [
    scorecard,
    {
      title: "First Response Template",
      description: "Copy-ready text for new form fills, voicemails, or inbound leads.",
      format: "text",
      body:
        "Hi, this is [Name] with [Company]. I saw your request come through and wanted to get you the fastest next step. Text me the service need, your zip code, and the best callback number.",
    },
    {
      title: "3-Message Follow-Up Sequence",
      description: "Three follow-up touches after the first response.",
      bullets: [
        "Message 1: I saw your request and can help. Text back the service need and zip code.",
        "Message 2: I can call now or send the next available [Time Window]. Which works better?",
        "Message 3: Closing the loop for now. Reply YES if you still want help from [Company].",
      ],
    },
    {
      title: "Lead Owner Rules",
      description: "The minimum operating rules that stop follow-up from living in memory.",
      bullets: [
        "Assign one owner to every new lead.",
        "Mark every lead booked, quoted, waiting, nurture, or dead.",
        "Review open leads at the end of each workday.",
      ],
    },
    handoff,
  ];
}

function buildMissedCallsResponse(payload: BusinessDiagnosticPayload) {
  const tradeId = payload.trade;
  const scenario = payload.currentProcess;
  const profile = TRADE_AUDIT_PROFILES[tradeId];

  return buildResponse(
    "missed_calls",
    tradeId,
    scenario,
    `${profile.summaryAngle} The target outcome is clear: ${payload.goal}`,
    [
      { label: "Likely leak", value: profile.likelyLeak },
      { label: "Operational weakness", value: profile.likelyWeakness },
      { label: "Fix this first", value: profile.firstFix },
    ],
    [
      {
        title: "Fix This First Scorecard",
        description: "The fastest read on what is broken and where to start.",
        bullets: [
          ...buildScorecard(profile, payload),
          `Scenario snapshot: "${compactText(scenario)}"`,
        ],
      },
      {
        title: "Missed-Call Text-Back Script",
        description: "Copy-ready text to send immediately after a missed call.",
        format: "text",
        body: profile.textBackMessage,
      },
      {
        title: "3-Message Follow-Up Sequence",
        description: "Three short messages for a lead that has not responded yet.",
        bullets: profile.followUpSequence,
      },
      {
        title: "Quote Follow-Up Template",
        description: "Copy-ready text for an estimate or quote that has gone quiet.",
        format: "text",
        body: buildQuoteFollowUpTemplate(payload),
      },
      {
        title: "Ironclad Ops Handoff",
        description: "The workflow pieces that can be installed for the business.",
        bullets: profile.implementationBullets,
      },
    ],
    [
      "Install the text-back script today.",
      `Assign one owner for ${getTradeDefinition(tradeId).label.toLowerCase()} inbound leads.`,
      "Run the three-message sequence before marking leads dead.",
    ],
  );
}

function buildGenericTradeAwareResponse(
  payload: BusinessDiagnosticPayload,
): DiagnosticResponse {
  const problemId = payload.problemType;
  const tradeId = payload.trade;
  const scenario = payload.currentProcess;
  const trade = getTradeDefinition(tradeId);
  const businessSize = getBusinessSizeDefinition(payload.businessSize);

  return buildResponse(
    problemId,
    tradeId,
    scenario,
    `${trade.label} selected for a ${businessSize.label.toLowerCase()} business. This plan stays centered on the current process and the goal: ${payload.goal}`,
    [
      { label: "Likely leak", value: `${trade.label} leads waiting too long` },
      { label: "Operational weakness", value: "No clear follow-up owner" },
      { label: "Fix this first", value: "Respond faster with one visible workflow" },
    ],
    buildGenericProblemSections(payload),
    [
      "Install one callback owner today.",
      "Use the first response template on every new lead.",
      "Track every lead until it is booked, quoted, or dead.",
    ],
  );
}

export function buildMockDiagnosticResponse(
  payload: BusinessDiagnosticPayload,
): DiagnosticResponse {
  if (payload.problemType === "missed_calls") {
    return buildMissedCallsResponse(payload);
  }

  return buildGenericTradeAwareResponse(payload);
}
