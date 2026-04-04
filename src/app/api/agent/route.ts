import { NextResponse } from "next/server";
import { generateAgentResponse } from "@/lib/live-agent";
import type { AgentId } from "@/lib/types";

type AgentRequest = {
  agent?: string;
  scenario?: string;
};

const VALID_AGENTS = new Set<AgentId>(["ops", "sales", "marketing", "growth"]);

export async function POST(request: Request) {
  const body = (await request.json()) as AgentRequest;
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
    await generateAgentResponse(agent as AgentId, scenario),
  );
}
