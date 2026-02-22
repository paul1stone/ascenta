CREATE TABLE "tracked_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_run_id" uuid NOT NULL,
	"workflow_output_id" uuid,
	"title" text NOT NULL,
	"document_type" text DEFAULT 'corrective_action' NOT NULL,
	"employee_name" text,
	"stage" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tracked_documents" ADD CONSTRAINT "tracked_documents_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_documents" ADD CONSTRAINT "tracked_documents_workflow_output_id_workflow_outputs_id_fk" FOREIGN KEY ("workflow_output_id") REFERENCES "public"."workflow_outputs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tracked_documents_workflow_run_idx" ON "tracked_documents" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "tracked_documents_stage_idx" ON "tracked_documents" USING btree ("stage");
