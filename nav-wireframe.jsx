import { useState } from "react";

const CATEGORIES = [
  {
    name: "Grow",
    icon: "🌱",
    color: "#4a9",
    subs: ["Performance", "Coaching", "Learn & Develop", "Leadership", "Safety"],
  },
  {
    name: "Care",
    icon: "💚",
    color: "#5a8",
    subs: ["Benefits", "Wellness", "Support"],
  },
  {
    name: "Protect",
    icon: "🛡",
    color: "#68b",
    subs: ["Compliance", "Security", "Risk"],
  },
  {
    name: "Plan",
    icon: "📋",
    color: "#88a",
    subs: ["Workforce", "Succession", "Budget", "Goals"],
  },
  {
    name: "Attract",
    icon: "🧲",
    color: "#a86",
    subs: ["Recruiting", "Branding", "Onboarding"],
  },
  {
    name: "Launch",
    icon: "🚀",
    color: "#b68",
    subs: ["Projects", "Programs", "Initiatives", "Rollouts"],
  },
];

const FUNCTIONS = ["Do", "Learn", "Status", "Insights"];

const FUNC_ICONS = { Do: "▶", Learn: "📖", Status: "◉", Insights: "📊" };

const FUNC_CONTENT = {
  Do: {
    title: "Action Center",
    desc: "Primary workspace for executing tasks",
    blocks: ["Quick Actions", "Active Tasks", "Recent Activity", "Shortcuts"],
  },
  Learn: {
    title: "Knowledge Base",
    desc: "Documentation, guides, and training",
    blocks: ["Getting Started", "Tutorials", "Best Practices", "FAQs"],
  },
  Status: {
    title: "Status Dashboard",
    desc: "Real-time monitoring and health checks",
    blocks: ["System Health", "Active Alerts", "Performance", "History"],
  },
  Insights: {
    title: "Analytics & Insights",
    desc: "Data analysis and reporting",
    blocks: ["Key Metrics", "Trends", "Reports", "Recommendations"],
  },
};

const mono = { fontFamily: "monospace" };

function WireBlock({ label, h = 80, color }) {
  return (
    <div
      style={{
        border: `1.5px dashed ${color || "#aaa"}`,
        borderRadius: 4,
        height: h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color || "#888",
        fontSize: 13,
        ...mono,
        background: color ? `${color}11` : "#f8f8f8",
      }}
    >
      {label}
    </div>
  );
}

function Breadcrumb({ cat, sub, func }) {
  const crumbs = [cat, sub, func].filter(Boolean);
  return (
    <div style={{ fontSize: 12, color: "#999", ...mono, marginBottom: 12, display: "flex", gap: 6 }}>
      {crumbs.map((c, i) => (
        <span key={i}>
          {i > 0 && <span style={{ margin: "0 4px" }}>/</span>}
          {c}
        </span>
      ))}
    </div>
  );
}

function CompassIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="none" stroke="#666" strokeWidth="2" />
      <circle cx="20" cy="20" r="2" fill="#666" />
      <polygon points="20,4 17,18 20,15 23,18" fill="#c44" />
      <polygon points="20,36 17,22 20,25 23,22" fill="#68b" />
      <polygon points="36,20 22,17 25,20 22,23" fill="#4a9" />
      <polygon points="4,20 18,17 15,20 18,23" fill="#b86" />
    </svg>
  );
}

export default function NavWireframe() {
  const [layout, setLayout] = useState("ascenta");
  const [activeCat, setActiveCat] = useState(0);
  const [activeSub, setActiveSub] = useState(0);
  const [activeFunc, setActiveFunc] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [compassOpen, setCompassOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [ascView, setAscView] = useState("dashboard");

  const cat = CATEGORIES[activeCat];
  const sub = cat.subs[activeSub] || cat.subs[0];
  const func = FUNCTIONS[activeFunc];
  const content = FUNC_CONTENT[func];
  const resetSub = () => setActiveSub(0);

  // ══════════════════════════════════════
  // Layout D: Ascenta (from whiteboard)
  // ══════════════════════════════════════
  const renderAscenta = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex", alignItems: "center", height: 52,
          borderBottom: "2px solid #ddd", background: "#fafafa", paddingRight: 16, flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "0 16px",
            borderRight: "1px solid #ddd", height: "100%", cursor: "pointer",
          }}
          onClick={() => setAscView("dashboard")}
        >
          <CompassIcon size={30} />
          <div>
            <div style={{ ...mono, fontSize: 10, color: "#999", letterSpacing: 2 }}>ASCENTA</div>
            <div style={{ ...mono, fontSize: 14, fontWeight: 700, color: "#333", marginTop: -2 }}>
              {ascView === "dashboard" ? "Home" : cat.name.toUpperCase()}
            </div>
          </div>
        </div>

        {ascView === "detail" && (
          <div style={{ display: "flex", height: "100%", alignItems: "flex-end", marginLeft: 8 }}>
            {cat.subs.map((s, si) => (
              <div
                key={si}
                onClick={() => setActiveSub(si)}
                style={{
                  padding: "8px 16px", cursor: "pointer", ...mono, fontSize: 12,
                  fontWeight: si === activeSub ? 700 : 400,
                  color: si === activeSub ? "#333" : "#888",
                  borderBottom: si === activeSub ? `3px solid ${cat.color}` : "3px solid transparent",
                  marginBottom: -2,
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ ...mono, fontSize: 11, color: "#bbb" }}>StoneCyber</span>
          <span style={{ cursor: "pointer", fontSize: 16, color: "#999" }} title="Help">?</span>
          <span style={{ cursor: "pointer", fontSize: 16, color: "#999" }} title="Settings">⚙</span>
          <span style={{ cursor: "pointer", fontSize: 16, color: "#999" }} title="User">👤</span>
          <span style={{ cursor: "pointer", fontSize: 16, color: "#999" }} title="Account">☰</span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Compass sidebar rail */}
        <div
          style={{
            width: compassOpen ? 140 : 52, background: "#f4f4f4", borderRight: "1.5px solid #ddd",
            flexShrink: 0, transition: "width 0.2s", overflow: "hidden",
          }}
          onMouseEnter={() => setCompassOpen(true)}
          onMouseLeave={() => { setCompassOpen(false); setHoveredCat(null); }}
        >
          <div style={{ padding: "12px 0", textAlign: "center", borderBottom: "1px solid #ddd", ...mono, fontSize: 10, color: "#aaa", letterSpacing: 1 }}>
            {compassOpen ? "NAVIGATE" : "◈"}
          </div>
          {CATEGORIES.map((c, ci) => (
            <div
              key={ci}
              onMouseEnter={() => setHoveredCat(ci)}
              onClick={() => { setActiveCat(ci); resetSub(); setAscView("detail"); }}
              style={{
                padding: compassOpen ? "10px 14px" : "10px 0",
                cursor: "pointer", ...mono, fontSize: 13,
                fontWeight: ci === activeCat && ascView === "detail" ? 700 : 400,
                color: hoveredCat === ci ? "#222" : ci === activeCat && ascView === "detail" ? "#333" : "#777",
                background: hoveredCat === ci ? "#e8e8e8" : ci === activeCat && ascView === "detail" ? "#eee" : "transparent",
                borderLeft: ci === activeCat && ascView === "detail" ? `3px solid ${c.color}` : "3px solid transparent",
                textAlign: compassOpen ? "left" : "center",
                whiteSpace: "nowrap", transition: "background 0.15s",
              }}
            >
              {compassOpen ? `${c.icon} ${c.name}` : c.icon}
            </div>
          ))}
        </div>

        {/* Main content */}
        {ascView === "dashboard" ? (
          <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
            <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 4 }}>
              Good Morning, Franklin
            </div>
            <div style={{ ...mono, fontSize: 12, color: "#aaa", marginBottom: 28 }}>
              Here's your status overview across all areas
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {CATEGORIES.map((c, ci) => (
                <div
                  key={ci}
                  onClick={() => { setActiveCat(ci); resetSub(); setActiveFunc(2); setAscView("detail"); }}
                  style={{
                    border: `2px solid ${c.color}44`, borderRadius: 6, padding: 16,
                    cursor: "pointer", background: "#fff", transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 2px 12px ${c.color}22`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${c.color}44`; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: "#333" }}>{c.name} Status</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {c.subs.slice(0, 3).map((s, si) => (
                      <div key={si} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ ...mono, fontSize: 10, color: "#999", width: 80, flexShrink: 0 }}>{s}</span>
                        <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 3 }}>
                          <div style={{ width: `${60 + (ci * 7 + si * 13) % 35}%`, height: "100%", background: c.color, borderRadius: 3, opacity: 0.7 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: 16, border: "1.5px dashed #ccc", borderRadius: 6, ...mono, fontSize: 12, color: "#aaa", textAlign: "center" }}>
              Initial Login Info / Quick Start Guide / Announcements
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1.5px solid #ddd", background: "#fafafa", paddingLeft: 8 }}>
              <div
                onClick={() => setAscView("dashboard")}
                style={{ padding: "10px 14px", cursor: "pointer", ...mono, fontSize: 12, color: "#aaa", borderRight: "1px solid #eee", marginRight: 4 }}
              >
                ← Home
              </div>
              {FUNCTIONS.map((f, fi) => (
                <div
                  key={fi}
                  onClick={() => setActiveFunc(fi)}
                  style={{
                    padding: "10px 20px", cursor: "pointer", ...mono, fontSize: 12,
                    fontWeight: fi === activeFunc ? 700 : 400,
                    color: fi === activeFunc ? "#333" : "#888",
                    borderBottom: fi === activeFunc ? `3px solid ${cat.color}` : "3px solid transparent",
                    background: fi === activeFunc ? "#fff" : "transparent",
                  }}
                >
                  {FUNC_ICONS[f]} {f}
                </div>
              ))}
            </div>
            <div style={{ padding: 24, overflow: "auto", flex: 1 }}>
              <Breadcrumb cat={cat.name} sub={sub} func={func} />
              <h2 style={{ ...mono, fontSize: 20, margin: "0 0 4px", color: "#333" }}>{content.title}</h2>
              <p style={{ ...mono, fontSize: 12, color: "#999", margin: "0 0 20px" }}>{cat.name} / {sub} — {content.desc}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {content.blocks.map((b, i) => <WireBlock key={i} label={b} h={100} color={cat.color} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════
  // Layout A: Sidebar + Tabs
  // ══════════════════════════════════════
  const renderSidebarTabs = () => (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          width: sidebarCollapsed ? 52 : 220, background: "#f0f0f0", borderRight: "2px solid #ccc",
          transition: "width 0.2s", overflow: "hidden", flexShrink: 0, display: "flex", flexDirection: "column",
        }}
      >
        {/* Compass logo + branding */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: sidebarCollapsed ? "12px 0" : "12px 14px",
            borderBottom: "1.5px solid #ddd", justifyContent: sidebarCollapsed ? "center" : "flex-start",
          }}
        >
          <CompassIcon size={sidebarCollapsed ? 24 : 28} />
          {!sidebarCollapsed && (
            <div>
              <div style={{ ...mono, fontSize: 10, color: "#999", letterSpacing: 2 }}>ASCENTA</div>
              <div style={{ ...mono, fontSize: 11, color: "#bbb", marginTop: -2 }}>StoneCyber</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ background: "none", border: "none", padding: "8px 10px", cursor: "pointer", textAlign: sidebarCollapsed ? "center" : "left", fontSize: 12, color: "#999", ...mono, borderBottom: "1px solid #eee", width: "100%" }}
        >
          {sidebarCollapsed ? "→" : "← collapse"}
        </button>
        <div style={{ overflow: "auto", flex: 1 }}>
          {CATEGORIES.map((c, ci) => (
            <div key={ci}>
              <div
                onClick={() => { setActiveCat(ci); resetSub(); }}
                style={{
                  padding: sidebarCollapsed ? "10px 0" : "10px 14px", cursor: "pointer",
                  background: ci === activeCat ? "#ddd" : "transparent", ...mono, fontSize: 13,
                  fontWeight: ci === activeCat ? 700 : 400,
                  borderLeft: ci === activeCat ? `3px solid ${c.color}` : "3px solid transparent",
                  textAlign: sidebarCollapsed ? "center" : "left", whiteSpace: "nowrap",
                }}
              >
                {sidebarCollapsed ? c.icon : `${c.icon} ${c.name}`}
              </div>
              {!sidebarCollapsed && ci === activeCat && c.subs.map((s, si) => (
                <div
                  key={si}
                  onClick={() => setActiveSub(si)}
                  style={{
                    padding: "6px 14px 6px 30px", cursor: "pointer",
                    background: si === activeSub ? "#e8e8e8" : "transparent", ...mono, fontSize: 12,
                    color: si === activeSub ? "#333" : "#777", fontWeight: si === activeSub ? 600 : 400,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "2px solid #ccc", background: "#fafafa" }}>
          {FUNCTIONS.map((f, fi) => (
            <div
              key={fi}
              onClick={() => setActiveFunc(fi)}
              style={{
                padding: "12px 24px", cursor: "pointer", ...mono, fontSize: 13,
                fontWeight: fi === activeFunc ? 700 : 400,
                borderBottom: fi === activeFunc ? `3px solid ${cat.color}` : "3px solid transparent",
                color: fi === activeFunc ? "#222" : "#888", background: fi === activeFunc ? "#fff" : "transparent",
              }}
            >
              {FUNC_ICONS[f]} {f}
            </div>
          ))}
        </div>
        <div style={{ padding: 24, overflow: "auto", flex: 1 }}>
          <Breadcrumb cat={cat.name} sub={sub} func={func} />
          <h2 style={{ ...mono, fontSize: 20, margin: "0 0 4px", color: "#333" }}>{content.title}</h2>
          <p style={{ ...mono, fontSize: 12, color: "#999", margin: "0 0 20px" }}>{sub} — {content.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {content.blocks.map((b, i) => <WireBlock key={i} label={b} h={100} color={cat.color} />)}
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════
  // Layout B: Top Nav + Side Sub
  // ══════════════════════════════════════
  const renderTopNavSideSub = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", borderBottom: "2px solid #ccc", background: "#f0f0f0" }}>
        {CATEGORIES.map((c, ci) => (
          <div
            key={ci}
            onClick={() => { setActiveCat(ci); resetSub(); }}
            style={{
              padding: "12px 16px", cursor: "pointer", ...mono, fontSize: 12,
              fontWeight: ci === activeCat ? 700 : 400,
              borderBottom: ci === activeCat ? `3px solid ${c.color}` : "3px solid transparent",
              color: ci === activeCat ? "#222" : "#777",
              background: ci === activeCat ? "#e8e8e8" : "transparent", whiteSpace: "nowrap",
            }}
          >
            {c.icon} {c.name}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 160, background: "#f7f7f7", borderRight: "1.5px solid #ddd", flexShrink: 0 }}>
          <div style={{ padding: "12px 14px 6px", ...mono, fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>subcategories</div>
          {cat.subs.map((s, si) => (
            <div
              key={si}
              onClick={() => setActiveSub(si)}
              style={{
                padding: "8px 14px", cursor: "pointer", ...mono, fontSize: 12,
                fontWeight: si === activeSub ? 600 : 400, color: si === activeSub ? "#222" : "#777",
                background: si === activeSub ? "#eee" : "transparent",
                borderLeft: si === activeSub ? `3px solid ${cat.color}` : "3px solid transparent",
              }}
            >
              {s}
            </div>
          ))}
          <div style={{ padding: "16px 14px 6px", ...mono, fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>functions</div>
          {FUNCTIONS.map((f, fi) => (
            <div
              key={fi}
              onClick={() => setActiveFunc(fi)}
              style={{
                padding: "8px 14px", cursor: "pointer", ...mono, fontSize: 12,
                fontWeight: fi === activeFunc ? 600 : 400, color: fi === activeFunc ? "#222" : "#777",
                background: fi === activeFunc ? "#eee" : "transparent",
                borderLeft: fi === activeFunc ? `3px solid ${cat.color}` : "3px solid transparent",
              }}
            >
              {FUNC_ICONS[f]} {f}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
          <Breadcrumb cat={cat.name} sub={sub} func={func} />
          <h2 style={{ ...mono, fontSize: 20, margin: "0 0 4px", color: "#333" }}>{content.title}</h2>
          <p style={{ ...mono, fontSize: 12, color: "#999", margin: "0 0 20px" }}>{sub} — {content.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {content.blocks.map((b, i) => <WireBlock key={i} label={b} h={100} color={cat.color} />)}
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════
  // Layout C: Mega Menu + Tabs
  // ══════════════════════════════════════
  const renderMegaMenu = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #ccc", background: "#f0f0f0", padding: "0 16px", height: 48, position: "relative", zIndex: 10 }}>
        <div
          onClick={() => setMegaOpen(!megaOpen)}
          style={{ padding: "8px 16px", cursor: "pointer", ...mono, fontSize: 13, fontWeight: 700, background: megaOpen ? "#ddd" : "#e8e8e8", borderRadius: 4, marginRight: 16 }}
        >
          {cat.icon} {cat.name} / {sub} ▾
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {FUNCTIONS.map((f, fi) => (
            <div
              key={fi}
              onClick={() => setActiveFunc(fi)}
              style={{
                padding: "8px 16px", cursor: "pointer", ...mono, fontSize: 12,
                fontWeight: fi === activeFunc ? 700 : 400,
                borderBottom: fi === activeFunc ? `3px solid ${cat.color}` : "3px solid transparent",
                color: fi === activeFunc ? "#222" : "#888",
              }}
            >
              {FUNC_ICONS[f]} {f}
            </div>
          ))}
        </div>
      </div>
      {megaOpen && (
        <div style={{
          position: "absolute", top: 48, left: 0, right: 0, background: "#fff",
          border: "2px solid #ccc", borderTop: "none", zIndex: 20, padding: 20,
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}>
          {CATEGORIES.map((c, ci) => (
            <div key={ci} style={mono}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#333", borderBottom: "1px solid #eee", paddingBottom: 6 }}>
                {c.icon} {c.name}
              </div>
              {c.subs.map((s, si) => (
                <div
                  key={si}
                  onClick={() => { setActiveCat(ci); setActiveSub(si); setMegaOpen(false); }}
                  style={{
                    padding: "4px 0 4px 12px", cursor: "pointer", fontSize: 12,
                    color: ci === activeCat && si === activeSub ? "#222" : "#888",
                    fontWeight: ci === activeCat && si === activeSub ? 600 : 400,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div style={{ flex: 1, padding: 24, overflow: "auto" }} onClick={() => megaOpen && setMegaOpen(false)}>
        <Breadcrumb cat={cat.name} sub={sub} func={func} />
        <h2 style={{ ...mono, fontSize: 20, margin: "0 0 4px", color: "#333" }}>{content.title}</h2>
        <p style={{ ...mono, fontSize: 12, color: "#999", margin: "0 0 20px" }}>{sub} — {content.desc}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {content.blocks.map((b, i) => <WireBlock key={i} label={b} h={100} color={cat.color} />)}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════
  // Main
  // ══════════════════════════════════════
  const layouts = [
    { id: "ascenta", label: "D: Ascenta (whiteboard)" },
    { id: "sidebar-tabs", label: "A: Sidebar + Tabs" },
    { id: "topnav-sidesub", label: "B: Top Nav + Side Panel" },
    { id: "mega-tabs", label: "C: Mega Menu + Tabs" },
  ];

  const annotations = {
    ascenta: <><strong>Pattern D — Ascenta (your whiteboard):</strong> Compass sidebar rail expands on hover. Selecting a category loads subcategory tabs in the header bar. Dashboard home shows all 6 status cards at a glance with personalized greeting. Do/Learn/Status/Insights as function tabs in detail view. <em>Best of both worlds: overview dashboard + deep-dive navigation.</em></>,
    "sidebar-tabs": <><strong>Pattern A — Sidebar + Tabs:</strong> Categories &amp; subs in collapsible sidebar. Do/Learn/Status/Insights as horizontal tabs. Best for power users. <em>Trade-off: deep sidebar can get long.</em></>,
    "topnav-sidesub": <><strong>Pattern B — Top Nav + Side Panel:</strong> Categories across top. Subs + functions stacked in left panel. Best for frequent category-jumping. <em>Trade-off: top bar gets tight with 6 items.</em></>,
    "mega-tabs": <><strong>Pattern C — Mega Menu + Tabs:</strong> Single dropdown shows all categories/subs at once. Cleanest chrome. <em>Trade-off: extra click, less discoverable.</em></>,
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", ...mono, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2a2a2a", color: "#fff", fontSize: 11, flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ opacity: 0.5, marginRight: 6 }}>NAV PATTERN:</span>
        {layouts.map((l) => (
          <button
            key={l.id}
            onClick={() => { setLayout(l.id); if (l.id === "ascenta") setAscView("dashboard"); }}
            style={{
              padding: "5px 12px", border: layout === l.id ? "2px solid #fff" : "1px solid #555",
              background: layout === l.id ? "#555" : "transparent", color: "#fff", ...mono, fontSize: 11,
              cursor: "pointer", borderRadius: 3,
            }}
          >
            {l.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", opacity: 0.4, fontSize: 10 }}>
          {CATEGORIES.reduce((a, c) => a + c.subs.length, 0)} subcategories • 4 functions each
        </span>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {layout === "ascenta" && renderAscenta()}
        {layout === "sidebar-tabs" && renderSidebarTabs()}
        {layout === "topnav-sidesub" && renderTopNavSideSub()}
        {layout === "mega-tabs" && renderMegaMenu()}
      </div>
      <div style={{ padding: "10px 16px", background: "#f8f8f0", borderTop: "2px solid #ddd", fontSize: 11, ...mono, color: "#666", flexShrink: 0 }}>
        {annotations[layout]}
      </div>
    </div>
  );
}
