import {
  SnowflakeIcon,
  AutoAwesomeIcon,
  WarningIcon,
  TerrainIcon,
  CloseIcon,
  CheckIcon,
} from "@/components/icons";

export function WhyChoose() {
  return (
    <section className="py-24 bg-glacier border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-black mb-4 uppercase tracking-tight text-deep-blue">
            Why Choose Ascenta?
          </h2>
          <div className="w-16 h-1.5 bg-summit mx-auto mb-6" />
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            See how AI-driven HR stacks up against the old way of doing things.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Manual HR Card */}
          <div className="p-10 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute top-4 right-4 text-slate-100">
              <WarningIcon className="size-16" />
            </div>

            {/* Icon Badge */}
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-8">
              <SnowflakeIcon className="text-red-500 size-8" />
            </div>

            <h3 className="text-2xl font-black mb-4 text-deep-blue">
              The Frostbite (Manual HR)
            </h3>

            <p className="text-slate-600 leading-relaxed mb-8">
              Traditional HR is fragmented across emails and documents. Tasks get
              rebuilt repeatedly, decisions are inconsistent, and risk is hidden
              in the shadows.
            </p>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-500 font-medium">
                <CloseIcon className="text-red-400 size-5 flex-shrink-0" />
                High administrative drag
              </li>
              <li className="flex items-center gap-3 text-slate-500 font-medium">
                <CloseIcon className="text-red-400 size-5 flex-shrink-0" />
                Escalation blind spots
              </li>
              <li className="flex items-center gap-3 text-slate-500 font-medium">
                <CloseIcon className="text-red-400 size-5 flex-shrink-0" />
                Inconsistent documentation
              </li>
              <li className="flex items-center gap-3 text-slate-500 font-medium">
                <CloseIcon className="text-red-400 size-5 flex-shrink-0" />
                Compliance gaps and audit risk
              </li>
              <li className="flex items-center gap-3 text-slate-500 font-medium">
                <CloseIcon className="text-red-400 size-5 flex-shrink-0" />
                Scattered data across systems
              </li>
            </ul>
          </div>

          {/* Ascenta Card */}
          <div className="p-10 rounded-3xl bg-deep-blue text-white border border-deep-blue shadow-2xl relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute top-4 right-4 text-white/5">
              <TerrainIcon className="size-16" />
            </div>

            {/* Icon Badge */}
            <div className="w-14 h-14 bg-summit rounded-xl flex items-center justify-center mb-8">
              <AutoAwesomeIcon className="text-white size-8" />
            </div>

            <h3 className="text-2xl font-black mb-4">The Ascent Advantage</h3>

            <p className="text-slate-300 leading-relaxed mb-8">
              Ascenta puts AI inside the workflow. It guides users step by step,
              ensuring the climb is efficient and the path to the summit is
              clear.
            </p>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckIcon className="text-summit size-5 flex-shrink-0" />
                Smart risk flagging
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckIcon className="text-summit size-5 flex-shrink-0" />
                Consistent human control
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckIcon className="text-summit size-5 flex-shrink-0" />
                Automated audit trails
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckIcon className="text-summit size-5 flex-shrink-0" />
                Built-in compliance frameworks
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckIcon className="text-summit size-5 flex-shrink-0" />
                Single source of truth
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
