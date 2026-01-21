import { Button } from "@/components/ui/button";
import { ExploreIcon, ChevronDownIcon } from "@/components/icons";

export function Hero() {
  return (
    <header className="relative min-h-screen flex items-center justify-center text-center px-4 pt-20 overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(12, 30, 61, 0.4), rgba(12, 30, 61, 0.85)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuAp6A42-aLN7jIYswjKYkPBK0z1oMGRztj7Uuve6SA-EYabjCvZ4-Yre-r2RyIC7aIzsfnFfvMdiPz8pN7nzetYbigOwVkRVWU1xxwEBGeGCdC3-WPIP-KdmzVdng1w0a2rlojLSSe0ddArBFz4LIPNBtEUbwz_twq1q00VR7De59KGHOSmNYisr5jHWT7pKPiDPdRXS2DhphdqFORNOLk13HoQAmzkilGsqx9skWehZulfqg3vQMS8EQYB8hDXKUhuhUU7sOjCu6I)`,
        }}
      />

      {/* Topographic Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuAmnd1F1cebgikhiqvhcW2Tsis8UzDEybY-J6wjJTS9L6_BO7bgtHyKSiyyav5EfLAd_vgOEOSo23lzoQGAb_kitqTGDdDHXsAA-_v6HhUEn21AwGzYx82J3bOkxyAPyAzk6MRjUshw0-jHnI82HZHzulH247KmZvcj7VyxnltBSHYMLy0QTquTfxYCOVG7nyZ_uCm8znxedzBmU33e5AjuG2ezeJ2MH_ufPLrB0B-QO9qrL56el3NXVLItwWOs1zqELLRlvpNAOeI)`,
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
