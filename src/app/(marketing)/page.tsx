import { Hero } from "@/components/hero";
import { PathToTop } from "@/components/path-to-top";
import { ExpeditionLeader } from "@/components/expedition-leader";
import { CompassSection } from "@/components/compass-section";
import { CTA } from "@/components/cta";

export default function Home() {
  return (
    <main>
      <Hero />
      <CompassSection />
      <PathToTop />
      <ExpeditionLeader />
      <CTA />
    </main>
  );
}
