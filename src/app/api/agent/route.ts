import { NextResponse } from "next/server";
import { buildMockResponse } from "@/lib/mock-agents";
import type { AgentId } from "@/lib/types";
import { wait } from "@/lib/utils";

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

  await wait(500);

  return NextResponse.json(buildMockResponse(agent as AgentId, scenario));
}
