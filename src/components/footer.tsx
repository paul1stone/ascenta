import Link from "next/link";
import { TerrainIcon, ShareIcon, MailIcon, LanguageIcon } from "@/components/icons";

const footerLinks = {
  product: {
    title: "The Product",
    links: [
      { label: "Basecamp Guide", href: "#" },
      { label: "Workflow Maps", href: "#" },
      { label: "Oxygen Integrations", href: "#" },
      { label: "Logbooks", href: "#" },
    ],
  },
  journey: {
    title: "The Journey",
    links: [
      { label: "About the Range", href: "#" },
      { label: "Safety Protocol", href: "#" },
      { label: "Expeditions", href: "#" },
    ],
  },
  baseCamp: {
    title: "Base Camp",
    links: [
      { label: "Training Center", href: "#" },
      { label: "Maps & APIs", href: "#" },
      { label: "Summit Support", href: "#" },
      { label: "SOS Contact", href: "#" },
    ],
  },
};

const socialLinks = [
  { icon: ShareIcon, href: "#", label: "Share" },
  { icon: MailIcon, href: "#", label: "Email" },
  { icon: LanguageIcon, href: "#", label: "Website" },
];

export function Footer() {
  return (
    <footer className="bg-deep-blue text-slate-400 border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <TerrainIcon className="text-summit size-8" />
              <span className="font-display text-2xl font-black tracking-tighter text-white uppercase">
                Ascenta
              </span>
            </Link>

            <p className="max-w-xs mb-8 leading-relaxed">
              Modernizing HR through AI-driven workflows that bring clarity,
              safety, and peak performance to every organizational peak.
            </p>

            <div className="flex gap-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="hover:text-summit transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-black text-white uppercase tracking-widest text-sm mb-8">
                {section.title}
              </h4>
              <ul className="space-y-4 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-summit transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest font-bold">
          <p>© 2024 Ascenta AI. Conquer the Peak.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
