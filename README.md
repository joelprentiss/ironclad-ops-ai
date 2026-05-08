# Ironclad AI / Ironclad Ops

Ironclad AI is a focused missed-call recovery and lead follow-up audit for local trades businesses. The app is intentionally narrow: a shop owner explains how inbound calls, voicemails, web leads, and quote requests are handled today, then gets a concise mini-deliverable back.

The product story is:

- `Ironclad AI`: free diagnostic + template generator
- `Ironclad Ops`: done-for-you implementation service

## What is included

- Single-page Next.js app
- Buyer-journey flow:
  - identify the problem
  - enter quick business context
  - receive diagnostic + template output
  - choose the next step
- Structured output with:
  - likely revenue leaks
  - likely operational weaknesses
  - fix-this-first scorecard
  - missed-call text-back script
  - 3-message follow-up sequence
  - quote or review templates where relevant
  - Ironclad Ops implementation CTA
- OpenAI-backed diagnostic responses with automatic mock fallback

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

- If `OPENAI_API_KEY` is present, the `/api/diagnose` route calls OpenAI and returns a structured live response.
- If `OPENAI_API_KEY` is missing, the app automatically uses the local mock diagnostics.
- If the OpenAI request fails or times out, the route falls back to local template responses so the buyer journey still works.

## Diagnostic request contract

The canonical `POST /api/diagnose` payload is now structured around business context:

```json
{
  "trade": "plumbing",
  "problemType": "missed_calls",
  "businessSize": "small_team",
  "currentProcess": "Missed calls go to voicemail and web leads are checked the next morning.",
  "goal": "Book more jobs from the calls and leads we already get.",
  "contactIntent": "undecided"
}
```

Migration notes:

- New clients should send `trade`, `problemType`, `businessSize`, `currentProcess`, `goal`, and optional `contactIntent`.
- The route still accepts the old `problemId`, `tradeId`, and `scenario` shape and normalizes it internally.
- Legacy requests default to `businessSize: "small_team"`, `goal: "Book more jobs from the calls and leads we already get."`, and no contact intent.
- The older `/api/agent` compatibility route still exists, but it now maps into the structured diagnostic payload.

## Key files

- `src/components/app-shell.tsx`: main missed-call audit funnel
- `src/components/problem-actions.tsx`: featured audit entry point
- `src/components/scenario-input.tsx`: structured business context form
- `src/components/buyer-journey-steps.tsx`: four-stage buyer journey progress
- `src/components/post-audit-conversion.tsx`: next-step capture layer after value is delivered
- `src/app/api/diagnose/route.ts`: primary diagnostic endpoint
- `src/app/api/lead-capture/route.ts`: placeholder lead capture endpoint
- `src/lib/live-diagnostics.ts`: OpenAI integration and focused audit response shaping
- `src/lib/mock-diagnostics.ts`: local fallback responses
- `src/lib/constants.ts`: featured audit definitions and presets

## How to extend

1. Tune the primary missed-call and follow-up audit in `src/lib/constants.ts`.
2. Tighten the audit prompt in `src/lib/live-diagnostics.ts`.
3. Keep the `POST /api/diagnose` contract stable so the UI stays simple.
4. Remove the legacy `/api/agent` compatibility route once nothing depends on it.
