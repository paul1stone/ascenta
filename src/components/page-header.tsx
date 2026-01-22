interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
}

export function PageHeader({ badge, title, description }: PageHeaderProps) {
  return (
    <div className="relative bg-deep-blue text-white pt-32 pb-20 overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuAmnd1F1cebgikhiqvhcW2Tsis8UzDEybY-J6wjJTS9L6_BO7bgtHyKSiyyav5EfLAd_vgOEOSo23lzoQGAb_kitqTGDdDHXsAA-_v6HhUEn21AwGzYx82J3bOkxyAPyAzk6MRjUshw0-jHnI82HZHzulH247KmZvcj7VyxnltBSHYMLy0QTquTfxYCOVG7nyZ_uCm8znxedzBmU33e5AjuG2ezeJ2MH_ufPLrB0B-QO9qrL56el3NXVLItwWOs1zqELLRlvpNAOeI)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {badge && (
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-summit/20 border border-summit/30 text-summit text-xs font-black uppercase tracking-[0.2em] mb-6">
            {badge}
          </div>
        )}
        <h1 className="font-display text-4xl md:text-6xl font-black mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
