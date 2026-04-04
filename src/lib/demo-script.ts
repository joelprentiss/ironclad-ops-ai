import type { DemoStep } from "@/lib/types";

export const AUTOPILOT_STEPS: DemoStep[] = [
  {
    id: "step-1",
    title: "Step 1: Ops Triage",
    note: "Show how the Virtual COO stabilizes a rough service day.",
    agent: "ops",
    scenario:
      "Two plumbers called out sick, the office is overbooked, and three urgent leak jobs are now pushing the afternoon schedule off track.",
  },
  {
    id: "step-2",
    title: "Step 2: Lead Recovery",
    note: "Pivot from operations into revenue rescue with a fast follow-up plan.",
    agent: "sales",
    scenario:
      "A homeowner requested an estimate for a full repipe, but the team waited 18 hours to respond and the lead is cooling off.",
  },
  {
    id: "step-3",
    title: "Step 3: Marketing Angle",
    note: "Turn a business gap into a campaign a small trade shop can launch this week.",
    agent: "marketing",
    scenario:
      "Spring tune-up bookings are soft and we need a practical promotion for our HVAC maintenance plan without cheapening the brand.",
  },
  {
    id: "step-4",
    title: "Step 4: Growth Lens",
    note: "Close the demo with the highest-leverage growth recommendation.",
    agent: "growth",
    scenario:
      "Revenue is steady but not climbing, referral volume is lumpy, and we need to choose the next best move for growth over the next month.",
  },
];

