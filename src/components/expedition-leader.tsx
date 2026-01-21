import { AltitudeIcon, LocationSearchingIcon, LandscapeIcon } from "@/components/icons";

const features = [
  {
    icon: AltitudeIcon,
    title: "Scale Without Drag",
    description:
      "Ascenta wraps AI around existing HR processes so work moves forward without bottlenecks, guesswork, or rework.",
  },
  {
    icon: LocationSearchingIcon,
    title: "Clear Documentation Trail",
    description:
      "Never lose track of your path. From onboarding to investigations, every step is logged with surgical precision.",
  },
];

export function ExpeditionLeader() {
  return (
    <section className="py-24 bg-deep-blue text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
        <LandscapeIcon className="size-[400px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-summit/20 border border-summit/30 text-summit text-xs font-black uppercase tracking-[0.2em] mb-8">
              Expedition Leader
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-black mb-8 leading-tight">
              Precision tools for the
              <br />
              <span className="text-summit">High-Altitude</span> HR Leader.
            </h2>

            <div className="space-y-8 text-lg leading-relaxed text-slate-300">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-6 items-start">
                  <span className="text-summit bg-summit/10 p-3 rounded-xl flex-shrink-0">
                    <feature.icon className="size-6" />
                  </span>
                  <div>
                    <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-summit/20 rounded-full blur-[100px]" />

            <div className="relative bg-white/5 p-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7ZyrZJyy1jSAGQwG0BC7PC1V8zmj1ok4_G8090wZ8xspL7ph97lkS7U4fA7-U-cfUb265x3taCzl1pwdeBx_ejAdfuZ4FtsnpEdcQKgn1mgPN76_8rc9YP-CSOHsVAJ_2QIhTFSdBKFiOf8agu2ItB79ILpIq1AWqJLuPcWIuzA_yfU0pq8D9fd3oPUosNSn0txxVTmEh0yeZqIGTbg5jWtFGqh8AZHfh0ny7kwWURP9RiXlbJguxnsnr7DEB8Y1jzfq174OsErs"
                alt="Majestic Sunlit Snowy Mountain Peak"
                className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
