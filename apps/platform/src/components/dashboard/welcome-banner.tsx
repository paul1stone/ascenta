function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function WelcomeBanner() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-deep-blue">
        {getGreeting()}, Jason
      </h1>
      <p className="mt-1 text-muted-foreground">
        {getFormattedDate()} &middot; Here&apos;s what&apos;s happening
      </p>
    </div>
  );
}
