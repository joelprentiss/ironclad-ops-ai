import { NextResponse } from "next/server";
import { buildMockResponse } from "@/lib/mock-agents";
import type { AgentId } from "@/lib/types";
import { wait } from "@/lib/utils";

type AgentRequest = {
  agent?: AgentId;
  scenario?: string;
};

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

  await wait(500);

  return NextResponse.json(buildMockResponse(agent, scenario));
}

