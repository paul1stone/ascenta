"use client";

import { CompassMenu } from "@/components/compass-menu";

export function CompassSection() {
  return (
    <section className="py-24 bg-glacier border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-display font-black mb-4 uppercase tracking-tight text-deep-blue">
            Your Command Center
          </h2>
          <div className="w-16 h-1.5 bg-summit mx-auto mb-6" />
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Everything you need, one click away. Explore the platform by navigating the compass.
          </p>
        </div>

        {/* Compass */}
        <div className="flex justify-center">
          <CompassMenu size={1020} />
        </div>
      </div>
    </section>
  );
}
