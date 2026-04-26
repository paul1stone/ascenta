export const FOCUS_LAYER_STATUSES = ["draft", "submitted", "confirmed"] as const;
export type FocusLayerStatus = (typeof FOCUS_LAYER_STATUSES)[number];

export const FOCUS_LAYER_PROMPTS = [
  {
    key: "uniqueContribution",
    label: "What I bring uniquely",
    helper: "What do you bring to this role that no one else does in quite the same way?",
    placeholder:
      "e.g., I translate complex technical decisions into product narratives the GTM team can sell from.",
  },
  {
    key: "highImpactArea",
    label: "Where I create the most impact",
    helper: "Where does your work create the biggest result for the team or the company?",
    placeholder: "",
  },
  {
    key: "signatureResponsibility",
    label: "Responsibilities I own that shape the team",
    helper:
      "What responsibilities do you carry in a way that shapes how others on the team operate?",
    placeholder: "",
  },
  {
    key: "workingStyle",
    label: "How I prefer to work and collaborate",
    helper: "How do you do your best work? What working patterns help you and the team thrive?",
    placeholder: "",
  },
] as const;

export type FocusLayerPromptKey = (typeof FOCUS_LAYER_PROMPTS)[number]["key"];

export const FOCUS_LAYER_STATUS_LABELS: Record<FocusLayerStatus, string> = {
  draft: "Draft",
  submitted: "Awaiting confirmation",
  confirmed: "Confirmed",
};
