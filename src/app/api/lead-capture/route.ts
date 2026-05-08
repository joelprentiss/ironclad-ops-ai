import { NextResponse } from "next/server";
import { LEAD_CAPTURE_ACTIONS, recordLeadCapture } from "@/lib/lead-capture";
import { PROBLEM_DEFINITIONS, TRADE_DEFINITIONS } from "@/lib/constants";
import type {
  LeadCaptureAction,
  LeadCapturePayload,
  ProblemId,
  TradeId,
} from "@/lib/types";

type LeadCaptureRequest = Partial<LeadCapturePayload>;

const VALID_ACTIONS = new Set<LeadCaptureAction>(
  LEAD_CAPTURE_ACTIONS.map((action) => action.id),
);

const VALID_PROBLEMS = new Set<ProblemId>(
  PROBLEM_DEFINITIONS.map((problem) => problem.id),
);

const VALID_TRADES = new Set<TradeId>(TRADE_DEFINITIONS.map((trade) => trade.id));

function isLeadCaptureAction(value: unknown): value is LeadCaptureAction {
  return typeof value === "string" && VALID_ACTIONS.has(value as LeadCaptureAction);
}

function isProblemId(value: unknown): value is ProblemId {
  return typeof value === "string" && VALID_PROBLEMS.has(value as ProblemId);
}

function isTradeId(value: unknown): value is TradeId {
  return typeof value === "string" && VALID_TRADES.has(value as TradeId);
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^\S+@\S+\.\S+$/.test(value.trim());
}

export async function POST(request: Request) {
  const body = (await request.json()) as LeadCaptureRequest;

  if (!isLeadCaptureAction(body.action)) {
    return NextResponse.json({ error: "Choose a valid next step." }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!isProblemId(body.problemId) || !isTradeId(body.tradeId)) {
    return NextResponse.json({ error: "Audit context is missing." }, { status: 400 });
  }

  const email = body.email.trim();

  const payload: LeadCapturePayload = {
    action: body.action,
    name: body.name.trim(),
    email,
    phone: body.phone?.trim(),
    businessName: body.businessName?.trim(),
    tradeId: body.tradeId,
    tradeLabel: body.tradeLabel?.trim() ?? "",
    problemId: body.problemId,
    auditTitle: body.auditTitle?.trim() ?? "Missed Call Recovery Audit",
    scenario: body.scenario?.trim() ?? "",
    source: "post_audit_cta",
  };

  const result = await recordLeadCapture(payload);

  return NextResponse.json(result);
}
