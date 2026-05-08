import { NextResponse } from "next/server";
import {
  DEFAULT_BUSINESS_SIZE,
  DEFAULT_DIAGNOSTIC_GOAL,
  DEFAULT_TRADE_ID,
  getProblemFromLegacyAgent,
} from "@/lib/constants";
import { generateDiagnosticResponse } from "@/lib/live-diagnostics";
import type { AgentId } from "@/lib/types";

type LegacyAgentRequest = {
  agent?: string;
  scenario?: string;
};

const VALID_AGENTS = new Set<AgentId>(["ops", "sales", "marketing", "growth"]);

export async function POST(request: Request) {
  const body = (await request.json()) as LegacyAgentRequest;
  const agent = body.agent;
  const scenario = body.scenario?.trim();

  if (!agent || !scenario) {
    return NextResponse.json(
      { error: "Agent and scenario are required." },
      { status: 400 },
    );
  }

  if (!VALID_AGENTS.has(agent as AgentId)) {
    return NextResponse.json(
      { error: "Unknown agent requested." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    await generateDiagnosticResponse({
      trade: DEFAULT_TRADE_ID,
      problemType: getProblemFromLegacyAgent(agent as AgentId),
      businessSize: DEFAULT_BUSINESS_SIZE,
      currentProcess: scenario,
      goal: DEFAULT_DIAGNOSTIC_GOAL,
      contactIntent: "undecided",
    }),
  );
}
