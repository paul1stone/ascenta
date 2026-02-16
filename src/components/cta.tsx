import { Button } from "@/components/ui/button";
import { FilterHdrIcon } from "@/components/icons";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Topographic Pattern */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuAmnd1F1cebgikhiqvhcW2Tsis8UzDEybY-J6wjJTS9L6_BO7bgtHyKSiyyav5EfLAd_vgOEOSo23lzoQGAb_kitqTGDdDHXsAA-_v6HhUEn21AwGzYx82J3bOkxyAPyAzk6MRjUshw0-jHnI82HZHzulH247KmZvcj7VyxnltBSHYMLy0QTquTfxYCOVG7nyZ_uCm8znxedzBmU33e5AjuG2ezeJ2MH_ufPLrB0B-QO9qrL56el3NXVLItwWOs1zqELLRlvpNAOeI)`,
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <FilterHdrIcon className="text-summit size-16 mx-auto mb-8" />

        <h2 className="text-5xl md:text-6xl font-display font-black mb-8 text-deep-blue leading-tight uppercase tracking-tighter">
          Don&apos;t Climb Alone.{" "}
          <br />
          <span className="text-summit">Scale Confidently.</span>
        </h2>

        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium">
          Join hundreds of forward-thinking companies using Ascenta to transform
          their people processes into a competitive advantage.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            asChild
            className="bg-summit hover:bg-summit-hover text-white px-12 py-6 h-auto rounded-xl font-black text-xl uppercase tracking-widest shadow-2xl shadow-orange-900/30 transform hover:scale-105 transition-all"
          >
            <Link href="/book-demo">Book Your Expedition</Link>
          </Button>
          <Button
            asChild
            className="bg-deep-blue hover:bg-slate-900 text-white px-12 py-6 h-auto rounded-xl font-black text-xl uppercase tracking-widest shadow-xl"
          >
            <Link href="/pricing">Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
