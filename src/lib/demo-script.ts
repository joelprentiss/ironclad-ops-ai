import type { DemoStep } from "@/lib/types";

export const AUTOPILOT_STEPS: DemoStep[] = [
  {
    id: "step-1",
    title: "Step 1: Ops Recovery",
    note: "Route a service-delivery problem into the operations playbook.",
    agent: "ops",
    scenario: "I run a plumbing business. Jobs are always late and customers are complaining.",
  },
  {
    id: "step-2",
    title: "Step 2: Lead Conversion",
    note: "Turn a raw inquiry into a cleaner sales motion with message drafts.",
    agent: "sales",
    scenario: "Customer needs water heater installation. Wants a quote.",
  },
  {
    id: "step-3",
    title: "Step 3: Local Marketing",
    note: "Generate a campaign angle and ready-to-use marketing assets.",
    agent: "marketing",
    scenario: "Create content to attract more local plumbing customers.",
  },
  {
    id: "step-4",
    title: "Step 4: Growth Move",
    note: "Finish with the next scale decision for an owner-operator business.",
    agent: "growth",
    scenario: "I'm making $120k/year working solo. What's next?",
  },
];
