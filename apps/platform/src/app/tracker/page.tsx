import { DocumentTracker } from "@/components/document-tracker";

export default function TrackerPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-blue">Document Tracker</h1>
          <p className="mt-1 text-muted-foreground">Track and manage HR documents through their delivery lifecycle.</p>
        </div>
        <DocumentTracker />
      </div>
    </div>
  );
}
