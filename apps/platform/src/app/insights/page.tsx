import { CategoryStatusCard } from "@/components/overview/category-status-card";

const CATEGORIES = [
  { key: "grow", label: "Grow", subtitle: "Performance & Development", color: "#44aa99" },
  { key: "plan", label: "Plan", subtitle: "Strategy & Workforce Planning", color: "#6688bb" },
  { key: "attract", label: "Attract", subtitle: "Hiring Pipeline", color: "#aa8866" },
  { key: "launch", label: "Launch", subtitle: "Onboarding & Enablement", color: "#bb6688" },
  { key: "care", label: "Care", subtitle: "Total Rewards & Leave", color: "#cc6677" },
  { key: "protect", label: "Protect", subtitle: "Feedback & Case Management", color: "#8888aa" },
] as const;

function PlaceholderContent() {
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed py-6">
      <span className="text-xs text-muted-foreground">Insights coming soon</span>
    </div>
  );
}

export default function InsightsOverviewPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-foreground">Insights</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Analytics and reporting across all HR domains
        </p>
      </div>

      <div className="space-y-4">
        {/* Grow — full width with detail link (only category with a detail page) */}
        <CategoryStatusCard
          label="Grow"
          subtitle="Performance & Development"
          color="#44aa99"
          detailHref="/insights/grow"
        >
          <PlaceholderContent />
        </CategoryStatusCard>

        {/* Plan & Attract — full width, no detail links yet */}
        {CATEGORIES.filter((c) => ["plan", "attract"].includes(c.key)).map((cat) => (
          <CategoryStatusCard
            key={cat.key}
            label={cat.label}
            subtitle={cat.subtitle}
            color={cat.color}
          >
            <PlaceholderContent />
          </CategoryStatusCard>
        ))}

        {/* Launch, Care, Protect — horizontal row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATEGORIES.filter((c) => ["launch", "care", "protect"].includes(c.key)).map((cat) => (
            <CategoryStatusCard
              key={cat.key}
              label={cat.label}
              subtitle={cat.subtitle}
              color={cat.color}
            >
              <PlaceholderContent />
            </CategoryStatusCard>
          ))}
        </div>
      </div>
    </div>
  );
}
