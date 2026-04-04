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
- Mock agent responses behind a single API route

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

## Key files

- `src/app/page.tsx`: app entry
- `src/components/app-shell.tsx`: main interactive experience
- `src/app/api/agent/route.ts`: demo response endpoint
- `src/lib/mock-agents.ts`: placeholder agent logic
- `src/lib/demo-script.ts`: scripted four-step demo

## How to extend

1. Replace the mock response builder in `src/lib/mock-agents.ts` with real LLM orchestration.
2. Keep the `POST /api/agent` contract stable so the UI does not need to change.
3. Add richer response schemas agent by agent once the demo flow is locked.
