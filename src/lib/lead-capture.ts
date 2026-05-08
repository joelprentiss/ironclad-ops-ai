import type {
  LeadCaptureAction,
  LeadCapturePayload,
  LeadCaptureResult,
} from "@/lib/types";

export type LeadCaptureActionDefinition = {
  id: LeadCaptureAction;
  label: string;
  eyebrow: string;
  description: string;
  submitLabel: string;
  priority: "soft" | "strong";
};

export const LEAD_CAPTURE_ACTIONS: LeadCaptureActionDefinition[] = [
  {
    id: "send_plan",
    label: "Send me this",
    eyebrow: "Keep the audit",
    description:
      "Get the leak summary, first fixes, and text-back workflow sent over so you can review it with the team.",
    submitLabel: "Send me this",
    priority: "soft",
  },
  {
    id: "get_templates",
    label: "Get templates",
    eyebrow: "Use it yourself",
    description:
      "Receive the missed-call text-back and follow-up sequence as copy-ready templates.",
    submitLabel: "Get templates",
    priority: "soft",
  },
  {
    id: "build_for_me",
    label: "Have Ironclad Ops build it",
    eyebrow: "Done-for-you",
    description:
      "Ask Ironclad Ops to install the workflow, automations, and handoff rules for your shop.",
    submitLabel: "Ask Ironclad Ops to build it",
    priority: "strong",
  },
];

const ACTION_MAP = Object.fromEntries(
  LEAD_CAPTURE_ACTIONS.map((action) => [action.id, action]),
) as Record<LeadCaptureAction, LeadCaptureActionDefinition>;

export function getLeadCaptureAction(action: LeadCaptureAction) {
  return ACTION_MAP[action];
}

export async function recordLeadCapture(
  payload: LeadCapturePayload,
): Promise<LeadCaptureResult> {
  const action = getLeadCaptureAction(payload.action);
  const leadId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `lead-${Date.now()}`;

  console.info("Lead capture placeholder received", {
    leadId,
    action: payload.action,
    trade: payload.tradeLabel,
    email: payload.email,
    source: payload.source,
  });

  return {
    status: "received",
    leadId,
    action: payload.action,
    message:
      action.id === "build_for_me"
        ? "Ironclad Ops request received. This placeholder can be wired to a CRM, booking flow, or email alert next."
        : "Lead capture received. This placeholder can be wired to email delivery next.",
    deliveryMode: "stub",
  };
}
