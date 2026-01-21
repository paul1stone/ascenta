import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { PathToTop } from "@/components/path-to-top";
import { ExpeditionLeader } from "@/components/expedition-leader";
import { WhyChoose } from "@/components/why-choose";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PathToTop />
        <ExpeditionLeader />
        <WhyChoose />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
