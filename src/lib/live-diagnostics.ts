import OpenAI from "openai";
import {
  getBusinessSizeDefinition,
  getProblemAgent,
  getProblemDefinition,
  getTradeDefinition,
} from "@/lib/constants";
import {
  buildMockDiagnosticResponse,
  detectTradeContext,
  detectUrgency,
} from "@/lib/mock-diagnostics";
import type {
  BusinessDiagnosticPayload,
  DiagnosticResponse,
  OutputSection,
  ProblemId,
  ResponseHighlight,
  TradeId,
} from "@/lib/types";

const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";
const OPENAI_TIMEOUT_MS = 20000;
type JsonSchema = { [key: string]: unknown };

type DiagnosticDraft = {
  summary: string;
  highlights: Array<{
    label: string;
    value: string;
  }>;
  sections: Array<{
    title: string;
    description: string;
    format: "bullets" | "text";
    bullets: string[];
    body: string;
  }>;
  quick_actions: string[];
};

const DIAGNOSTIC_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    highlights: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "string" },
        },
        required: ["label", "value"],
        additionalProperties: false,
      },
    },
    sections: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          format: {
            type: "string",
            enum: ["bullets", "text"],
          },
          bullets: {
            type: "array",
            items: {
              type: "string",
            },
          },
          body: { type: "string" },
        },
        required: ["title", "description", "format", "bullets", "body"],
        additionalProperties: false,
      },
    },
    quick_actions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "string",
      },
    },
  },
  required: ["summary", "highlights", "sections", "quick_actions"],
  additionalProperties: false,
};

const FIELD_DOCUMENT_RULES = `Global writing rules:
- Output must feel like a field document a small trades owner can use today.
- Prioritize scripts, templates, scorecards, routing rules, and next actions over explanation.
- Use plain language. No hype, no broad business theory, no "strategic considerations", no AI-speak.
- Keep summary to 2 short sentences. Keep bullets concrete and under 18 words when possible.
- Use placeholders such as [Company], [Name], [Customer], [Service], [Zip], and [Time Window].
- Text template sections must be copy-ready, not commentary about the template.
- Every quick action must start with a verb and be doable in one workday.
- The final section should support a natural handoff into Ironclad Ops implementation.`;

const TRADE_PROMPT_GUIDANCE: Record<TradeId, string> = {
  plumbing: `Selected trade: Plumbing.
Use plumbing examples: emergency calls, leaks, drains, water heaters, after-hours response, dispatch speed, and estimate follow-up.
Make the assets sound like they belong in a plumbing office or dispatch workflow.`,
  hvac: `Selected trade: HVAC.
Use HVAC examples: no-cool, no-heat, maintenance plans, tune-ups, replacement leads, seasonal urgency, and peak-volume triage.
Make the assets season-aware and useful for a CSR or dispatcher.`,
  electrical: `Selected trade: Electrical.
Use electrical examples: panel work, troubleshooting, safety concerns, quote delays, scheduling clarity, and homeowner trust.
Make the assets clear, professional, and confidence-building.`,
  roofing: `Selected trade: Roofing.
Use roofing examples: storm leads, roof inspections, leak calls, repair estimates, insurance-adjacent questions, and fast estimate follow-up.
Make the assets speed-focused and inspection-oriented.`,
  cleaning: `Selected trade: Cleaning.
Use cleaning examples: quote requests, recurring service, deep cleans, reminders, reactivation, and review-friendly communication.
Make the assets simple, repeatable, and office-friendly.`,
  landscaping: `Selected trade: Landscaping.
Use landscaping examples: seasonal estimate demand, recurring maintenance, project leads, route timing, quote follow-up, and repeat reminders.
Make the assets practical for seasonal field-service volume.`,
};

const PROBLEM_SYSTEM_PROMPTS: Record<ProblemId, string> = {
  missed_calls: `You are Ironclad AI, a diagnostic and template generator for local trades businesses.
Problem selected: Missed Call Recovery Audit.
Return JSON that matches the schema exactly.
${FIELD_DOCUMENT_RULES}

Required output:
- highlights: exactly 3 labels: "Likely leak", "Operational weakness", "Fix this first"
- sections: exactly 5 sections in this order
  1. "Fix This First Scorecard" / description "The fastest read on what is broken and where to start." / format "bullets"
     Bullets must score response speed, ownership, and follow-up depth as "Area: X/10 - note".
  2. "Missed-Call Text-Back Script" / description "Copy-ready text to send immediately after a missed call." / format "text"
  3. "3-Message Follow-Up Sequence" / description "Three short messages for a lead that has not responded yet." / format "bullets"
     Bullets must begin "Message 1", "Message 2", and "Message 3".
  4. "Quote Follow-Up Template" / description "Copy-ready text for an estimate or quote that has gone quiet." / format "text"
  5. "Ironclad Ops Handoff" / description "The workflow pieces that can be installed for the business." / format "bullets"
- quick_actions: exactly 3 short imperative strings
Infer likely revenue leaks and operational weaknesses from the scenario.`,
  no_lead_follow_up: `You are Ironclad AI, a diagnostic and template generator for local trades businesses.
Problem selected: No Lead Follow-Up.
Return JSON that matches the schema exactly.
${FIELD_DOCUMENT_RULES}

Required output:
- highlights: exactly 3 labels: "Likely leak", "Operational weakness", "Fix this first"
- sections: exactly 5 sections in this order
  1. "Fix This First Scorecard" / description "The fastest read on why warm leads are going cold." / format "bullets"
  2. "First Response Template" / description "Copy-ready text for new form fills, voicemails, or inbound leads." / format "text"
  3. "3-Message Follow-Up Sequence" / description "Three follow-up touches after the first response." / format "bullets"
  4. "Lead Owner Rules" / description "The minimum operating rules that stop follow-up from living in memory." / format "bullets"
  5. "Ironclad Ops Handoff" / description "The workflow pieces that can be installed for the business." / format "bullets"
- quick_actions: exactly 3 short imperative strings`,
  low_google_reviews: `You are Ironclad AI, a diagnostic and template generator for local trades businesses.
Problem selected: Low Google Reviews.
Return JSON that matches the schema exactly.
${FIELD_DOCUMENT_RULES}

Required output:
- highlights: exactly 3 labels: "Likely leak", "Operational weakness", "Fix this first"
- sections: exactly 5 sections in this order
  1. "Fix This First Scorecard" / description "The fastest read on why happy customers are not becoming reviews." / format "bullets"
  2. "Review Request Template" / description "Copy-ready review ask for a satisfied customer." / format "text"
  3. "3-Message Review Follow-Up" / description "Three light touches that do not feel pushy." / format "bullets"
  4. "Best Ask Timing" / description "When the team should ask and who should own it." / format "bullets"
  5. "Ironclad Ops Handoff" / description "The workflow pieces that can be installed for the business." / format "bullets"
- quick_actions: exactly 3 short imperative strings`,
  slow_quoting: `You are Ironclad AI, a diagnostic and template generator for local trades businesses.
Problem selected: Slow Quoting.
Return JSON that matches the schema exactly.
${FIELD_DOCUMENT_RULES}

Required output:
- highlights: exactly 3 labels: "Likely leak", "Operational weakness", "Fix this first"
- sections: exactly 5 sections in this order
  1. "Fix This First Scorecard" / description "The fastest read on where quoting momentum is breaking." / format "bullets"
  2. "Quote Follow-Up Template" / description "Copy-ready text for sending or chasing an estimate." / format "text"
  3. "3-Message Quote Sequence" / description "Three touches that keep the quote moving without sounding desperate." / format "bullets"
  4. "Quote Routing Rules" / description "Simple rules for speed, ownership, and margin protection." / format "bullets"
  5. "Ironclad Ops Handoff" / description "The workflow pieces that can be installed for the business." / format "bullets"
- quick_actions: exactly 3 short imperative strings`,
  no_online_booking: `You are Ironclad AI, a diagnostic and template generator for local trades businesses.
Problem selected: No Online Booking.
Return JSON that matches the schema exactly.
${FIELD_DOCUMENT_RULES}

Required output:
- highlights: exactly 3 labels: "Likely leak", "Operational weakness", "Fix this first"
- sections: exactly 5 sections in this order
  1. "Fix This First Scorecard" / description "The fastest read on where booking friction is costing calls." / format "bullets"
  2. "Booking Recommendation" / description "The simplest booking flow that fits this business." / format "bullets"
  3. "Booking Page Copy" / description "Copy-ready website text for the booking action." / format "text"
  4. "Lead Handoff Rules" / description "What happens after the booking request comes in." / format "bullets"
  5. "Ironclad Ops Handoff" / description "The workflow pieces that can be installed for the business." / format "bullets"
- quick_actions: exactly 3 short imperative strings`,
  weak_website_conversion: `You are Ironclad AI, a diagnostic and template generator for local trades businesses.
Problem selected: Weak Website Conversion.
Return JSON that matches the schema exactly.
${FIELD_DOCUMENT_RULES}

Required output:
- highlights: exactly 3 labels: "Likely leak", "Operational weakness", "Fix this first"
- sections: exactly 5 sections in this order
  1. "Fix This First Scorecard" / description "The fastest read on why visitors are not becoming leads." / format "bullets"
  2. "Above-The-Fold Fix" / description "What the first screen should say and show." / format "bullets"
  3. "CTA Rewrite" / description "Copy-ready call-to-action text for calls, forms, or booking." / format "text"
  4. "Trust Proof Checklist" / description "Small proof points that make the next step feel safer." / format "bullets"
  5. "Ironclad Ops Handoff" / description "The workflow pieces that can be installed for the business." / format "bullets"
- quick_actions: exactly 3 short imperative strings`,
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

function sanitizeHighlights(values: unknown) {
  if (!Array.isArray(values)) {
    throw new Error("Expected highlights to be an array.");
  }

  return values
    .filter(
      (value): value is { label: string; value: string } =>
        typeof value === "object" &&
        value !== null &&
        typeof (value as { label?: string }).label === "string" &&
        typeof (value as { value?: string }).value === "string",
    )
    .map((value) => ({
      label: value.label.trim(),
      value: value.value.trim(),
    }))
    .filter((value) => value.label && value.value);
}

function sanitizeSections(values: unknown) {
  if (!Array.isArray(values)) {
    throw new Error("Expected sections to be an array.");
  }

  return values
    .filter(
      (
        value,
      ): value is {
        title: string;
        description: string;
        format: "bullets" | "text";
        bullets: string[];
        body: string;
      } =>
        typeof value === "object" &&
        value !== null &&
        typeof (value as { title?: string }).title === "string" &&
        typeof (value as { description?: string }).description === "string" &&
        ((value as { format?: string }).format === "bullets" ||
          (value as { format?: string }).format === "text") &&
        Array.isArray((value as { bullets?: unknown[] }).bullets) &&
        typeof (value as { body?: string }).body === "string",
    )
    .map<OutputSection>((value) => ({
      title: value.title.trim(),
      description: value.description.trim(),
      format: value.format,
      bullets: sanitizeStringArray(value.bullets),
      body: value.body.trim(),
    }))
    .filter((section) => section.title && section.description);
}

function parseDraft(rawText: string) {
  const parsed = JSON.parse(rawText) as DiagnosticDraft;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("The model returned an invalid response shape.");
  }

  return parsed;
}

function buildLiveResponse(
  payload: BusinessDiagnosticPayload,
  rawText: string,
): DiagnosticResponse {
  const draft = parseDraft(rawText);
  const problemId = payload.problemType;
  const tradeId = payload.trade;
  const scenario = payload.currentProcess;
  const problem = getProblemDefinition(problemId);
  const trade = getTradeDefinition(tradeId);

  return {
    problemId,
    problemLabel: problem.label,
    mappedAgent: getProblemAgent(problemId),
    tradeId,
    tradeLabel: trade.label,
    mode: "live",
    modeLabel: "Live AI",
    title: problem.responseTitle,
    subtitle: problem.responseSubtitle,
    tradeContext: detectTradeContext(scenario, tradeId),
    urgency: detectUrgency(scenario, tradeId),
    summary: draft.summary.trim(),
    highlights: sanitizeHighlights(draft.highlights) as ResponseHighlight[],
    sections: sanitizeSections(draft.sections),
    quickActions: sanitizeStringArray(draft.quick_actions),
    implementationOffer: problem.implementationOffer,
  };
}

async function requestLiveDiagnosticResponse(
  payload: BusinessDiagnosticPayload,
): Promise<DiagnosticResponse> {
  const client = getOpenAIClient();

  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = getOpenAIModel();
  const problemId = payload.problemType;
  const tradeId = payload.trade;
  const trade = getTradeDefinition(tradeId);
  const businessSize = getBusinessSizeDefinition(payload.businessSize);
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
          content: `${PROBLEM_SYSTEM_PROMPTS[problemId]}\n\n${TRADE_PROMPT_GUIDANCE[tradeId]}`,
        },
        {
          role: "user",
          content:
            `Selected trade: ${trade.label}\n` +
            `Trade focus: ${trade.focus}\n\n` +
            `Business size: ${businessSize.label} - ${businessSize.description}\n` +
            `Owner goal: ${payload.goal}\n` +
            `Contact intent: ${payload.contactIntent ?? "undecided"}\n\n` +
            `Current process:\n${payload.currentProcess}\n\n` +
            "Return only valid JSON that matches the schema exactly. Make the output a concise, copy-ready field document with no general consulting filler.",
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: `${problemId}_${tradeId}_diagnostic_response`,
          schema: DIAGNOSTIC_SCHEMA,
          strict: true,
        },
      },
    }),
    OPENAI_TIMEOUT_MS,
  );

  if (!response.output_text?.trim()) {
    throw new Error("OpenAI returned an empty response.");
  }

  return buildLiveResponse(payload, response.output_text);
}

export async function generateDiagnosticResponse(
  payload: BusinessDiagnosticPayload,
): Promise<DiagnosticResponse> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return buildMockDiagnosticResponse(payload);
  }

  try {
    return await requestLiveDiagnosticResponse(payload);
  } catch (error) {
    console.error("Falling back to mock diagnostic response:", error);
    return buildMockDiagnosticResponse(payload);
  }
}
