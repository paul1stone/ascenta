/**
 * Action items (todo checklist) per document type and stage
 * Used on the document detail page to show what’s needed to move out of the current stage
 */

export type ActionItem = {
  id: string;
  label: string;
  /** Opens default email client with subject and body; document can be downloaded separately to attach */
  mailto?: { subject: string; body: string };
};

const CORRECTIVE_ACTION_ACTIONS: Record<string, ActionItem[]> = {
  draft: [
    { id: "reviewed_document", label: "Reviewed document for accuracy" },
    { id: "ready_to_send", label: "Ready to send to employee" },
  ],
  on_us_to_send: [
    {
      id: "sent_email",
      label: "Sent email to employee with document",
      mailto: {
        subject: "Follow-up: Corrective Action – {{title}}",
        body: "Hi,\n\nPlease find attached the corrective action document for your review (Document: {{title}}). We would like to schedule a time to discuss this with you.\n\nPlease let me know your availability.\n\nBest regards",
      },
    },
    { id: "scheduled_meeting", label: "Scheduled meeting to deliver in person" },
    { id: "document_attached", label: "Attached document (download below if needed)" },
  ],
  sent: [
    { id: "confirmed_receipt", label: "Confirmed employee received document" },
    { id: "meeting_scheduled", label: "Meeting to discuss scheduled" },
  ],
  in_review: [
    { id: "employee_acknowledged", label: "Employee acknowledged receipt" },
    { id: "response_received", label: "Received written response (if any)" },
  ],
  acknowledged: [
    { id: "filed_in_hr", label: "Filed in employee personnel file" },
    { id: "follow_up_dated", label: "Follow-up review date set" },
  ],
  completed: [],
};

const DEFAULT_ACTIONS: ActionItem[] = [
  { id: "reviewed", label: "Reviewed document" },
  { id: "sent", label: "Sent to recipient" },
];

export function getActionItemsForDocument(
  documentType: string,
  stage: string
): ActionItem[] {
  const byType =
    documentType === "corrective_action" ? CORRECTIVE_ACTION_ACTIONS : { [stage]: DEFAULT_ACTIONS };
  const items = byType[stage];
  return items?.length ? items : DEFAULT_ACTIONS;
}
