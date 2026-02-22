import { ExploreIcon } from "@/components/icons";

const stages = [
  {
    stage: "01",
    elevation: "1,000m",
    title: "Basecamp Setup",
    description:
      "Establish a rock-solid foundation by centralizing your fragmented HR data within the tranquil clarity of our misty valley AI core.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBjdbBv8HdK5XKfE1GTTPKURk0CrGExG3sM8XMAtUblZwddcUXo-fPxdte-3icA6JOjWFk0basIktlILu5MmxpegqKrnqHiRUbAlWYoc8BZK9_cKX_LHBkWzgraTaMIZUWfh0COCWZuc4YhFfHbdux1l8DU2T3U96SOt603L04GUEFT5S_DTZabi8D8RyEVS433GHqqV46lXavz03ydlSSy3t08vPOua040yyNkLH2N2gsa2n3OnCDRYZ-iXBFIn2G7dKZYwgCTgvk",
    featured: false,
  },
  {
    stage: "02",
    elevation: "4,500m",
    title: "Efficient Ascent",
    description:
      "Navigate the rugged ridges of complex workflows with precision. AI ensures your team never loses its footing during growth.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuANaiDHNPbcCNtKSR4EZHUp-OSC7FNpfzeRr0jYt0xCJE3ca6-RXxIYSdhcjW9sHZeOFXpE3_VTRaEYqZ9BRUG6681WapC9NcyFzNYVS7zP-kB-ucGlcHt3SQMZVD2327x6374zIohCqTuHo1pZccU5pj0A0YgFmmSu3ZyC7uY1Y_Ghfq3qvv_b_2pljriqgc7oMusvFqynqvwlUh92fQpE8YImLqKQYZt1h6nIweCuuYoUWkdd2UB9qBqqPyTPMguKarxrYDaHWdE",
    featured: true,
  },
  {
    stage: "03",
    elevation: "8,848m",
    title: "Peak Performance",
    description:
      "Reach the sunlit summit with standardized compliance and clear reporting, achieving absolute visibility at maximum altitude.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7ZyrZJyy1jSAGQwG0BC7PC1V8zmj1ok4_G8090wZ8xspL7ph97lkS7U4fA7-U-cfUb265x3taCzl1pwdeBx_ejAdfuZ4FtsnpEdcQKgn1mgPN76_8rc9YP-CSOHsVAJ_2QIhTFSdBKFiOf8agu2ItB79ILpIq1AWqJLuPcWIuzA_yfU0pq8D9fd3oPUosNSn0txxVTmEh0yeZqIGTbg5jWtFGqh8AZHfh0ny7kwWURP9RiXlbJguxnsnr7DEB8Y1jzfq174OsErs",
    featured: false,
  },
];

export function PathToTop() {
  return (
    <section className="py-24 bg-white relative">
      {/* Topographic Pattern */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuAmnd1F1cebgikhiqvhcW2Tsis8UzDEybY-J6wjJTS9L6_BO7bgtHyKSiyyav5EfLAd_vgOEOSo23lzoQGAb_kitqTGDdDHXsAA-_v6HhUEn21AwGzYx82J3bOkxyAPyAzk6MRjUshw0-jHnI82HZHzulH247KmZvcj7VyxnltBSHYMLy0QTquTfxYCOVG7nyZ_uCm8znxedzBmU33e5AjuG2ezeJ2MH_ufPLrB0B-QO9qrL56el3NXVLItwWOs1zqELLRlvpNAOeI)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-3 bg-deep-blue text-white rounded-full mb-6">
            <ExploreIcon className="size-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-deep-blue mb-4 uppercase tracking-tight">
            Your Path to the Top
          </h2>
          <p className="text-slate-500 font-medium text-lg">
            Every great achievement starts with a single, guided step through
            the landscape.
          </p>
        </div>

        {/* Stage Cards */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Dashed Line Connector */}
          <div className="hidden md:block absolute top-[40%] left-0 w-full h-0.5 border-t-2 border-dashed border-slate-200 -z-10" />

          {stages.map((stage) => (
            <div
              key={stage.stage}
              className={`bg-white rounded-3xl border shadow-xl overflow-hidden hover:shadow-2xl transition-all group ${
                stage.featured
                  ? "border-summit/30 scale-105 z-10"
                  : "border-slate-200"
              }`}
            >
              {/* Image */}
              <div
                className="h-48 w-full relative bg-cover bg-center"
                style={{ backgroundImage: `url(${stage.image})` }}
              >
                <div
                  className={`absolute inset-0 group-hover:bg-transparent transition-colors ${
                    stage.featured ? "bg-summit/10" : "bg-deep-blue/20"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-black text-summit uppercase tracking-widest">
                    Stage {stage.stage}
                  </span>
                  <span
                    className={`h-px flex-1 ${
                      stage.featured ? "bg-summit/20" : "bg-slate-100"
                    }`}
                  />
                  <span className="text-slate-400 text-xs font-bold">
                    {stage.elevation}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-deep-blue mb-4">
                  {stage.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
