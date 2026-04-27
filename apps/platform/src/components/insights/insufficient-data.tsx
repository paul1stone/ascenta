import { ShieldOff } from "lucide-react";

export function InsufficientData({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-slate-50/40 p-6 text-center">
      <ShieldOff className="size-5 text-slate-400" />
      <div className="text-xs font-medium text-foreground">Not enough data</div>
      <div className="text-[11px] text-muted-foreground max-w-xs">
        {message ?? "Cohort below the 5-employee privacy threshold. Broaden the filters to see this metric."}
      </div>
    </div>
  );
}
