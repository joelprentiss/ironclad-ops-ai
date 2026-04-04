import OpenAI from "openai";
import { AGENT_DEFINITIONS } from "@/lib/constants";
import {
  PROMPT_PLACEHOLDERS,
  buildMockResponse,
  detectTradeContext,
  detectUrgency,
} from "@/lib/mock-agents";
import type { AgentId, AgentResponse, OutputSection, ResponseHighlight } from "@/lib/types";

const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";
const OPENAI_TIMEOUT_MS = 20000;
type JsonSchema = { [key: string]: unknown };

type OpsDraft = {
  summary: string;
  highlights: {
    priority: string;
    risk: string;
    next_move: string;
  };
  root_cause_analysis: string[];
  immediate_fix: string[];
  dispatch_sop: string[];
  efficiency_improvements: string[];
  quick_actions: string[];
};

type SalesDraft = {
  summary: string;
  highlights: {
    lead_type: string;
    conversion_move: string;
    extra_revenue: string;
  };
  quote_message: string;
  sms_follow_up: string;
  objection_handling: string[];
  upsell_opportunity: string[];
  quick_actions: string[];
};

type MarketingDraft = {
  summary: string;
  highlights: {
    campaign_lane: string;
    fastest_asset: string;
    search_angle: string;
  };
  social_post: string;
  short_form_video_idea: string[];
  review_response: string;
  seo_topic: string[];
  quick_actions: string[];
};

type GrowthDraft = {
  summary: string;
  highlights: {
    best_lever: string;
    first_hire: string;
    scale_path: string;
  };
  pricing_improvement: string[];
  hiring_guidance: string[];
  revenue_optimization: string[];
  scaling_move: string[];
  quick_actions: string[];
};

const STRING_ARRAY_SCHEMA = {
  type: "array",
  items: {
    type: "string",
  },
};

const AGENT_SCHEMAS: Record<AgentId, JsonSchema> = {
  ops: {
    type: "object",
    properties: {
      summary: { type: "string" },
      highlights: {
        type: "object",
        properties: {
          priority: { type: "string" },
          risk: { type: "string" },
          next_move: { type: "string" },
        },
        required: ["priority", "risk", "next_move"],
        additionalProperties: false,
      },
      root_cause_analysis: STRING_ARRAY_SCHEMA,
      immediate_fix: STRING_ARRAY_SCHEMA,
      dispatch_sop: STRING_ARRAY_SCHEMA,
      efficiency_improvements: STRING_ARRAY_SCHEMA,
      quick_actions: STRING_ARRAY_SCHEMA,
    },
    required: [
      "summary",
      "highlights",
      "root_cause_analysis",
      "immediate_fix",
      "dispatch_sop",
      "efficiency_improvements",
      "quick_actions",
    ],
    additionalProperties: false,
  },
  sales: {
    type: "object",
    properties: {
      summary: { type: "string" },
      highlights: {
        type: "object",
        properties: {
          lead_type: { type: "string" },
          conversion_move: { type: "string" },
          extra_revenue: { type: "string" },
        },
        required: ["lead_type", "conversion_move", "extra_revenue"],
        additionalProperties: false,
      },
      quote_message: { type: "string" },
      sms_follow_up: { type: "string" },
      objection_handling: STRING_ARRAY_SCHEMA,
      upsell_opportunity: STRING_ARRAY_SCHEMA,
      quick_actions: STRING_ARRAY_SCHEMA,
    },
    required: [
      "summary",
      "highlights",
      "quote_message",
      "sms_follow_up",
      "objection_handling",
      "upsell_opportunity",
      "quick_actions",
    ],
    additionalProperties: false,
  },
  marketing: {
    type: "object",
    properties: {
      summary: { type: "string" },
      highlights: {
        type: "object",
        properties: {
          campaign_lane: { type: "string" },
          fastest_asset: { type: "string" },
          search_angle: { type: "string" },
        },
        required: ["campaign_lane", "fastest_asset", "search_angle"],
        additionalProperties: false,
      },
      social_post: { type: "string" },
      short_form_video_idea: STRING_ARRAY_SCHEMA,
      review_response: { type: "string" },
      seo_topic: STRING_ARRAY_SCHEMA,
      quick_actions: STRING_ARRAY_SCHEMA,
    },
    required: [
      "summary",
      "highlights",
      "social_post",
      "short_form_video_idea",
      "review_response",
      "seo_topic",
      "quick_actions",
    ],
    additionalProperties: false,
  },
  growth: {
    type: "object",
    properties: {
      summary: { type: "string" },
      highlights: {
        type: "object",
        properties: {
          best_lever: { type: "string" },
          first_hire: { type: "string" },
          scale_path: { type: "string" },
        },
        required: ["best_lever", "first_hire", "scale_path"],
        additionalProperties: false,
      },
      pricing_improvement: STRING_ARRAY_SCHEMA,
      hiring_guidance: STRING_ARRAY_SCHEMA,
      revenue_optimization: STRING_ARRAY_SCHEMA,
      scaling_move: STRING_ARRAY_SCHEMA,
      quick_actions: STRING_ARRAY_SCHEMA,
    },
    required: [
      "summary",
      "highlights",
      "pricing_improvement",
      "hiring_guidance",
      "revenue_optimization",
      "scaling_move",
      "quick_actions",
    ],
    additionalProperties: false,
  },
};

const AGENT_SYSTEM_PROMPTS: Record<AgentId, string> = {
  ops: `You are Ironclad Ops AI acting as an operations advisor for small trade businesses.
Return practical help for plumbers, electricians, HVAC teams, and owner-operators.
Be direct, high-trust, and implementation-focused.
Do not use hype, buzzwords, or generic AI phrasing.
Focus on root cause analysis, the immediate fix, a simple SOP, and efficiency improvements.
Write for an owner who needs to act today.
Keep each bullet concise but concrete.`,
  sales: `You are Ironclad Ops AI acting as a sales advisor for small trade businesses.
Return conversion-focused help for real service leads.
Be practical, local-feeling, and easy for a tech, CSR, or owner to use immediately.
Focus on a quote message, a short SMS follow-up, objection handling, and one relevant upsell opportunity.
Keep the tone confident, helpful, and non-pushy.`,
  marketing: `You are Ironclad Ops AI acting as a marketing advisor for small trade businesses.
Return assets a local trade business can actually publish this week.
Be specific, grounded, and useful for local service companies.
Focus on one social post, a short-form video idea, a review response, and one SEO topic.
Keep the language practical and believable.`,
  growth: `You are Ironclad Ops AI acting as a growth advisor for small trade businesses.
Return the next scaling move for an owner-operator or small team.
Be financially grounded, operationally realistic, and concise.
Focus on pricing improvement, hiring guidance, revenue optimization, and the next scaling move.
Avoid vague motivation. Give practical business advice.`,
};

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}

function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`OpenAI request timed out after ${timeoutMs}ms.`)), timeoutMs);
    }),
  ]);
}

function sanitizeStringArray(values: unknown) {
  if (!Array.isArray(values)) {
    throw new Error("Expected an array of strings.");
  }

  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildSectionsFromDraft(agent: AgentId, draft: OpsDraft | SalesDraft | MarketingDraft | GrowthDraft) {
  switch (agent) {
    case "ops":
      return [
        {
          title: "Root Cause Analysis",
          description: "Why the business is feeling late and chaotic right now.",
          bullets: sanitizeStringArray((draft as OpsDraft).root_cause_analysis),
        },
        {
          title: "Immediate Fix",
          description: "The same-day move to stop the bleeding.",
          bullets: sanitizeStringArray((draft as OpsDraft).immediate_fix),
        },
        {
          title: "Dispatch SOP",
          description: "A lightweight repeatable process for every service day.",
          bullets: sanitizeStringArray((draft as OpsDraft).dispatch_sop),
        },
        {
          title: "Efficiency Improvements",
          description: "Small systems that reduce chaos without adding software complexity.",
          bullets: sanitizeStringArray((draft as OpsDraft).efficiency_improvements),
        },
      ] satisfies OutputSection[];
    case "sales":
      return [
        {
          title: "Quote Message",
          description: "Use this as the email or text summary right after first contact.",
          format: "text",
          body: (draft as SalesDraft).quote_message.trim(),
        },
        {
          title: "SMS Follow-Up",
          description: "Short, direct, and easy for the customer to answer.",
          format: "text",
          body: (draft as SalesDraft).sms_follow_up.trim(),
        },
        {
          title: "Objection Handling",
          description: "Keep the conversation anchored in clarity and trust.",
          bullets: sanitizeStringArray((draft as SalesDraft).objection_handling),
        },
        {
          title: "Upsell Opportunity",
          description: "Attach something useful that fits the service naturally.",
          bullets: sanitizeStringArray((draft as SalesDraft).upsell_opportunity),
        },
      ] satisfies OutputSection[];
    case "marketing":
      return [
        {
          title: "Social Post",
          description: "A local-feeling post built for trust, not fluff.",
          format: "text",
          body: (draft as MarketingDraft).social_post.trim(),
        },
        {
          title: "Short-Form Video Idea",
          description: "Simple enough to shoot on a phone in one afternoon.",
          bullets: sanitizeStringArray((draft as MarketingDraft).short_form_video_idea),
        },
        {
          title: "Review Response",
          description: "Use this as the baseline reply to positive customer reviews.",
          format: "text",
          body: (draft as MarketingDraft).review_response.trim(),
        },
        {
          title: "SEO Topic",
          description: "One topic that matches local intent and sales readiness.",
          bullets: sanitizeStringArray((draft as MarketingDraft).seo_topic),
        },
      ] satisfies OutputSection[];
    case "growth":
      return [
        {
          title: "Pricing Improvement",
          description: "Make revenue per job stronger before adding complexity.",
          bullets: sanitizeStringArray((draft as GrowthDraft).pricing_improvement),
        },
        {
          title: "Hiring Guidance",
          description: "Do not hire based on exhaustion alone. Hire against the constraint.",
          bullets: sanitizeStringArray((draft as GrowthDraft).hiring_guidance),
        },
        {
          title: "Revenue Optimization",
          description: "Pull more value from work you already touch.",
          bullets: sanitizeStringArray((draft as GrowthDraft).revenue_optimization),
        },
        {
          title: "Scaling Move",
          description: "The next step is a tighter machine, not just more hustle.",
          bullets: sanitizeStringArray((draft as GrowthDraft).scaling_move),
        },
      ] satisfies OutputSection[];
  }
}

function buildHighlights(agent: AgentId, draft: OpsDraft | SalesDraft | MarketingDraft | GrowthDraft) {
  switch (agent) {
    case "ops":
      return [
        { label: "Priority", value: (draft as OpsDraft).highlights.priority.trim() },
        { label: "Risk", value: (draft as OpsDraft).highlights.risk.trim() },
        { label: "Best next move", value: (draft as OpsDraft).highlights.next_move.trim() },
      ] satisfies ResponseHighlight[];
    case "sales":
      return [
        { label: "Lead type", value: (draft as SalesDraft).highlights.lead_type.trim() },
        { label: "Conversion move", value: (draft as SalesDraft).highlights.conversion_move.trim() },
        { label: "Extra revenue", value: (draft as SalesDraft).highlights.extra_revenue.trim() },
      ] satisfies ResponseHighlight[];
    case "marketing":
      return [
        { label: "Campaign lane", value: (draft as MarketingDraft).highlights.campaign_lane.trim() },
        { label: "Fastest asset", value: (draft as MarketingDraft).highlights.fastest_asset.trim() },
        { label: "Search angle", value: (draft as MarketingDraft).highlights.search_angle.trim() },
      ] satisfies ResponseHighlight[];
    case "growth":
      return [
        { label: "Best lever", value: (draft as GrowthDraft).highlights.best_lever.trim() },
        { label: "First hire", value: (draft as GrowthDraft).highlights.first_hire.trim() },
        { label: "Scale path", value: (draft as GrowthDraft).highlights.scale_path.trim() },
      ] satisfies ResponseHighlight[];
  }
}

function getResponseFrame(agent: AgentId) {
  switch (agent) {
    case "ops":
      return {
        title: "Ops Recovery Blueprint",
        subtitle: "Stop the drift, protect customer trust, and tighten the daily board.",
      };
    case "sales":
      return {
        title: "Lead Conversion Pack",
        subtitle: "Turn a raw inquiry into a booked estimate and a stronger ticket.",
      };
    case "marketing":
      return {
        title: "Local Marketing Kit",
        subtitle: "Build visibility with assets a small service business can actually ship.",
      };
    case "growth":
      return {
        title: "Owner Growth Brief",
        subtitle: "Turn solo income into a business that can actually scale.",
      };
  }
}

function getAgentLabel(agent: AgentId) {
  return AGENT_DEFINITIONS.find((item) => item.id === agent)?.panelLabel ?? "Agent";
}

function parseDraft(agent: AgentId, rawText: string) {
  const parsed = JSON.parse(rawText) as OpsDraft | SalesDraft | MarketingDraft | GrowthDraft;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("The model returned an invalid response shape.");
  }

  return parsed;
}

function buildLiveResponse(agent: AgentId, scenario: string, rawText: string): AgentResponse {
  const draft = parseDraft(agent, rawText);
  const tradeContext = detectTradeContext(scenario);
  const urgency = detectUrgency(scenario);
  const frame = getResponseFrame(agent);

  return {
    agent,
    agentLabel: getAgentLabel(agent),
    mode: "live",
    modeLabel: "Live AI",
    title: frame.title,
    subtitle: frame.subtitle,
    tradeContext,
    urgency,
    summary: draft.summary.trim(),
    highlights: buildHighlights(agent, draft),
    sections: buildSectionsFromDraft(agent, draft),
    quickActions: sanitizeStringArray((draft as { quick_actions: string[] }).quick_actions),
    promptPlaceholder: PROMPT_PLACEHOLDERS[agent],
  };
}

async function requestLiveAgentResponse(agent: AgentId, scenario: string): Promise<AgentResponse> {
  const client = getOpenAIClient();

  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = getOpenAIModel();
  const response = await withTimeout(
    client.responses.create({
      model,
      stream: false,
      reasoning: {
        effort: "low",
      },
      input: [
        {
          role: "system",
          content: AGENT_SYSTEM_PROMPTS[agent],
        },
        {
          role: "user",
          content: `Business scenario:\n${scenario}\n\nReturn only valid JSON that matches the schema exactly.`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: `${agent}_agent_response`,
          schema: AGENT_SCHEMAS[agent],
          strict: true,
        },
      },
    }),
    OPENAI_TIMEOUT_MS,
  );

  if (!response.output_text?.trim()) {
    throw new Error("OpenAI returned an empty response.");
  }

  return buildLiveResponse(agent, scenario, response.output_text);
}

export async function generateAgentResponse(
  agent: AgentId,
  scenario: string,
): Promise<AgentResponse> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return buildMockResponse(agent, scenario);
  }

  try {
    return await requestLiveAgentResponse(agent, scenario);
  } catch (error) {
    console.error("Falling back to mock agent response:", error);
    return buildMockResponse(agent, scenario);
  }
}
