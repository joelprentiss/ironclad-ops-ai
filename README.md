# Ironclad Ops AI

Ironclad Ops AI is a competition-ready MVP for trade businesses that need fast, structured operational help. This scaffold focuses on demo quality over enterprise complexity: one polished screen, four focused agents, and a scripted Autopilot Demo.

## What is included

- Single-page Next.js app
- Scenario input with quick-start examples
- Four agent actions:
  - Analyze Ops
  - Handle Lead
  - Create Marketing
  - Growth Insights
- Structured output panel
- Scripted four-step Autopilot Demo
- OpenAI-backed agent responses with automatic mock fallback

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4

## Run locally

Use Node.js `20.9+`.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.4-mini
```

`OPENAI_MODEL` is optional. If omitted, the app defaults to `gpt-5.4-mini`.

## Live AI and fallback behavior

- If `OPENAI_API_KEY` is present, the `/api/agent` route calls OpenAI and returns a structured live response.
- If `OPENAI_API_KEY` is missing, the app automatically uses the existing local mock generators.
- If the OpenAI request fails or times out, the route falls back to the local mock response cleanly so the UI and Autopilot Demo still work.

## Key files

- `src/app/page.tsx`: app entry
- `src/components/app-shell.tsx`: main interactive experience
- `src/app/api/agent/route.ts`: demo response endpoint
- `src/lib/live-agent.ts`: OpenAI integration and structured response shaping
- `src/lib/mock-agents.ts`: placeholder agent logic
- `src/lib/demo-script.ts`: scripted four-step demo

## How to extend

1. Tune the agent prompts in `src/lib/live-agent.ts`.
2. Keep the `POST /api/agent` contract stable so the UI does not need to change.
3. Adjust model selection with `OPENAI_MODEL` if you want a different latency/cost tradeoff.
