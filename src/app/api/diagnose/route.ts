import { NextResponse } from "next/server";
import { generateDiagnosticResponse } from "@/lib/live-diagnostics";
import {
  BUSINESS_SIZE_OPTIONS,
  DEFAULT_BUSINESS_SIZE,
  DEFAULT_DIAGNOSTIC_GOAL,
  PROBLEM_DEFINITIONS,
  TRADE_DEFINITIONS,
} from "@/lib/constants";
import type {
  BusinessDiagnosticPayload,
  BusinessSize,
  ContactIntent,
  LegacyDiagnosticPayload,
  ProblemId,
  TradeId,
} from "@/lib/types";

type DiagnosticRequest = Partial<
  BusinessDiagnosticPayload &
    LegacyDiagnosticPayload & {
      trade?: string;
      problemType?: string;
      businessSize?: string;
      currentProcess?: string;
      goal?: string;
      contactIntent?: string;
    }
>;

const VALID_PROBLEMS = new Set<ProblemId>(
  PROBLEM_DEFINITIONS.map((problem) => problem.id),
);

const VALID_TRADES = new Set<TradeId>(TRADE_DEFINITIONS.map((trade) => trade.id));

const VALID_BUSINESS_SIZES = new Set<BusinessSize>(
  BUSINESS_SIZE_OPTIONS.map((size) => size.id),
);

const VALID_CONTACT_INTENTS = new Set<ContactIntent>([
  "send_plan",
  "get_templates",
  "build_for_me",
  "undecided",
]);

function asProblemId(value: unknown): ProblemId | null {
  return typeof value === "string" && VALID_PROBLEMS.has(value as ProblemId)
    ? (value as ProblemId)
    : null;
}

function asTradeId(value: unknown): TradeId | null {
  return typeof value === "string" && VALID_TRADES.has(value as TradeId)
    ? (value as TradeId)
    : null;
}

function asBusinessSize(value: unknown): BusinessSize {
  return typeof value === "string" && VALID_BUSINESS_SIZES.has(value as BusinessSize)
    ? (value as BusinessSize)
    : DEFAULT_BUSINESS_SIZE;
}

function asContactIntent(value: unknown): ContactIntent | undefined {
  return typeof value === "string" && VALID_CONTACT_INTENTS.has(value as ContactIntent)
    ? (value as ContactIntent)
    : undefined;
}

function normalizeDiagnosticPayload(
  body: DiagnosticRequest,
): BusinessDiagnosticPayload | { error: string } {
  const problemType = asProblemId(body.problemType ?? body.problemId);
  const trade = asTradeId(body.trade ?? body.tradeId);
  const currentProcess = (body.currentProcess ?? body.scenario)?.trim();
  const goal = body.goal?.trim() || DEFAULT_DIAGNOSTIC_GOAL;

  if (!problemType) {
    return { error: "Unknown or missing problem type." };
  }

  if (!trade) {
    return { error: "Unknown or missing trade." };
  }

  if (!currentProcess) {
    return { error: "Current process is required." };
  }

  return {
    trade,
    problemType,
    businessSize: asBusinessSize(body.businessSize),
    currentProcess,
    goal,
    contactIntent: asContactIntent(body.contactIntent),
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as DiagnosticRequest;
  const payload = normalizeDiagnosticPayload(body);

  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  return NextResponse.json(await generateDiagnosticResponse(payload));
}
