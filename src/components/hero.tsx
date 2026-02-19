import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExploreIcon, ChevronDownIcon } from "@/components/icons";

export function Hero() {
  return (
    <header className="relative min-h-screen flex items-center justify-center text-center px-4 pt-20 overflow-hidden">
      {/* Background Image */}
      <Image
        src="/front_bgrd.jpg"
        alt=""
        fill
        priority
        quality={90}
        className="object-cover object-center"
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(rgba(12, 30, 61, 0.35), rgba(12, 30, 61, 0.7))",
        }}
      />

      {/* Content */}
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Elevation Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="h-px w-12 bg-summit" />
          <span className="text-summit font-bold tracking-[0.3em] text-sm uppercase">
            Elevation: 8,848m
          </span>
          <span className="h-px w-12 bg-summit" />
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl md:text-8xl font-black text-white mb-8 leading-none tracking-tight">
          Climb to the
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-summit to-orange-300">
            Summit of Success
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          Ascenta empowers your HR teams with AI-guided workflows, turning steep
          organizational hurdles into a clear path to peak performance.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button className="bg-summit hover:bg-summit-hover text-white px-10 py-6 h-auto rounded-lg font-black text-lg uppercase tracking-wider shadow-2xl shadow-orange-950/40 transform hover:-translate-y-1 transition-all">
            Start the Ascent
          </Button>
          <Button
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white px-10 py-6 h-auto rounded-lg font-bold text-lg backdrop-blur-md border-white/30 hover:text-white"
          >
            <ExploreIcon className="size-5" />
            View the Map
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
        <ChevronDownIcon className="size-10" />
      </div>
    </header>
  );
}
