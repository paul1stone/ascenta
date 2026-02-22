(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/marketing/src/components/compass-menu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompassMenu",
    ()=>CompassMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_bba87d7111fefc510c53c3fc05c3bef9/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_bba87d7111fefc510c53c3fc05c3bef9/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_bba87d7111fefc510c53c3fc05c3bef9/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_bba87d7111fefc510c53c3fc05c3bef9/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$40$7$2e$9$2e$0$2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3@7.9.0/node_modules/d3/src/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__pie$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/pie.js [app-client] (ecmascript) <export default as pie>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$arc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__arc$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/arc.js [app-client] (ecmascript) <export default as arc>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/list-checks.js [app-client] (ecmascript) <export default as ListChecks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/history.js [app-client] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/clipboard-list.js [app-client] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/rocket.js [app-client] (ecmascript) <export default as Rocket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$workflow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Workflow$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/workflow.js [app-client] (ecmascript) <export default as Workflow>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2d$xml$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/code-xml.js [app-client] (ecmascript) <export default as Code2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mountain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mountain$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/mountain.js [app-client] (ecmascript) <export default as Mountain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plug$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/plug.js [app-client] (ecmascript) <export default as Plug>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/wrench.js [app-client] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.562.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const SUMMIT = "#ff6b35";
const DEEP_BLUE = "#0c1e3d";
const CARD_BG = "#ffffff";
const MUTED_BG = "#f5f5f5";
const MUTED_FG = "#8a8a8a";
const BORDER = "#e5e5e5";
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return {
        r,
        g,
        b
    };
}
function lighten(hex, amt = 0.2) {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${Math.min(255, r + (255 - r) * amt)}, ${Math.min(255, g + (255 - g) * amt)}, ${Math.min(255, b + (255 - b) * amt)})`;
}
const MENU_ITEMS = [
    {
        label: "Dashboard",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        color: SUMMIT,
        href: "/dashboard",
        subs: [
            {
                label: "Overview",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
                href: "/dashboard"
            },
            {
                label: "Tasks",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__["ListChecks"],
                href: "/dashboard"
            },
            {
                label: "Activity",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"],
                href: "/dashboard"
            }
        ]
    },
    {
        label: "Chat",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
        color: "#1a73e8",
        href: "/chat",
        subs: [
            {
                label: "New Chat",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"],
                href: "/chat"
            },
            {
                label: "History",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"],
                href: "/chat"
            },
            {
                label: "Templates",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
                href: "/chat"
            }
        ]
    },
    {
        label: "Tracker",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"],
        color: "#7c3aed",
        href: "/tracker",
        subs: [
            {
                label: "Pipeline",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$workflow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Workflow$3e$__["Workflow"],
                href: "/tracker"
            },
            {
                label: "Documents",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                href: "/tracker"
            },
            {
                label: "Reports",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
                href: "/tracker"
            }
        ]
    },
    {
        label: "Docs",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"],
        color: "#059669",
        href: "/docs",
        subs: [
            {
                label: "Start",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__["Rocket"],
                href: "/docs"
            },
            {
                label: "Workflows",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$workflow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Workflow$3e$__["Workflow"],
                href: "/docs"
            },
            {
                label: "API",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2d$xml$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code2$3e$__["Code2"],
                href: "/docs"
            },
            {
                label: "Compliance",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
                href: "/docs"
            }
        ]
    },
    {
        label: "Product",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mountain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mountain$3e$__["Mountain"],
        color: "#0891b2",
        href: "/product",
        subs: [
            {
                label: "Onboarding",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"],
                href: "/product"
            },
            {
                label: "Performance",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
                href: "/product"
            },
            {
                label: "Integrations",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plug$3e$__["Plug"],
                href: "/product"
            }
        ]
    },
    {
        label: "Learn AI",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"],
        color: "#dc2626",
        href: "/learn-ai",
        subs: [
            {
                label: "HR Leader",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
                href: "/learn-ai"
            },
            {
                label: "HR Ops",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"],
                href: "/learn-ai"
            },
            {
                label: "IT Admin",
                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$562$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
                href: "/learn-ai"
            }
        ]
    }
];
const BASE_INNER = 62;
const BASE_OUTER = 142;
const EXPAND_OUTER = 160;
const SUB_INNER = 168;
const SUB_OUTER = 240;
const SUB_HOVER_OUTER = 260;
const PAD_ANGLE = 0.04;
const SUB_PAD = 0.012;
const CORNER_RADIUS = 5;
const VIEWBOX = 580;
function LucideInSvg(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "d042642acaf53e03d52a28e9e98a7131c769b2e7d16a34f41a6018d8210cf910") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "d042642acaf53e03d52a28e9e98a7131c769b2e7d16a34f41a6018d8210cf910";
    }
    const { Icon, x, y, size: t1, color: t2, opacity: t3, transition: t4 } = t0;
    const size = t1 === undefined ? 18 : t1;
    const color = t2 === undefined ? "#fff" : t2;
    const opacity = t3 === undefined ? 1 : t3;
    const transition = t4 === undefined ? "all 0.3s ease" : t4;
    const t5 = x - size / 2;
    const t6 = y - size / 2;
    let t7;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = {
            pointerEvents: "none",
            overflow: "visible"
        };
        $[1] = t7;
    } else {
        t7 = $[1];
    }
    let t8;
    if ($[2] !== opacity || $[3] !== size || $[4] !== transition) {
        t8 = {
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition,
            opacity
        };
        $[2] = opacity;
        $[3] = size;
        $[4] = transition;
        $[5] = t8;
    } else {
        t8 = $[5];
    }
    const t9 = size * 0.85;
    let t10;
    if ($[6] !== Icon || $[7] !== color || $[8] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
            size: t9,
            color: color,
            strokeWidth: 2
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 223,
            columnNumber: 11
        }, this);
        $[6] = Icon;
        $[7] = color;
        $[8] = t9;
        $[9] = t10;
    } else {
        t10 = $[9];
    }
    let t11;
    if ($[10] !== t10 || $[11] !== t8) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t8,
            children: t10
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 233,
            columnNumber: 11
        }, this);
        $[10] = t10;
        $[11] = t8;
        $[12] = t11;
    } else {
        t11 = $[12];
    }
    let t12;
    if ($[13] !== size || $[14] !== t11 || $[15] !== t5 || $[16] !== t6) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("foreignObject", {
            x: t5,
            y: t6,
            width: size,
            height: size,
            style: t7,
            children: t11
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 242,
            columnNumber: 11
        }, this);
        $[13] = size;
        $[14] = t11;
        $[15] = t5;
        $[16] = t6;
        $[17] = t12;
    } else {
        t12 = $[17];
    }
    return t12;
}
_c = LucideInSvg;
function CompassMenu(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(66);
    if ($[0] !== "d042642acaf53e03d52a28e9e98a7131c769b2e7d16a34f41a6018d8210cf910") {
        for(let $i = 0; $i < 66; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "d042642acaf53e03d52a28e9e98a7131c769b2e7d16a34f41a6018d8210cf910";
    }
    const { size: t1, showLabel: t2 } = t0;
    const size = t1 === undefined ? 1160 : t1;
    const showLabel = t2 === undefined ? true : t2;
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [hoveredIndex, setHoveredIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedIndex, setSelectedIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hoveredSub, setHoveredSub] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeSub, setActiveSub] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [needleAngle, setNeedleAngle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-90);
    const needleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(-90);
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const CENTER = VIEWBOX / 2;
    let t3;
    let t4;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = ({
            "CompassMenu[useEffect()]": ()=>{
                const handleMouseMove = {
                    "CompassMenu[useEffect() > handleMouseMove]": (e)=>{
                        if (!svgRef.current) {
                            return;
                        }
                        const rect = svgRef.current.getBoundingClientRect();
                        const cx = rect.left + rect.width / 2;
                        const cy = rect.top + rect.height / 2;
                        const dx = e.clientX - cx;
                        const dy = e.clientY - cy;
                        const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                        const prev = needleRef.current;
                        let delta = rawAngle - prev % 360;
                        if (delta > 180) {
                            delta = delta - 360;
                        }
                        if (delta < -180) {
                            delta = delta + 360;
                        }
                        const next = prev + delta;
                        needleRef.current = next;
                        setNeedleAngle(next);
                    }
                }["CompassMenu[useEffect() > handleMouseMove]"];
                window.addEventListener("mousemove", handleMouseMove);
                return ()=>window.removeEventListener("mousemove", handleMouseMove);
            }
        })["CompassMenu[useEffect()]"];
        t4 = [];
        $[1] = t3;
        $[2] = t4;
    } else {
        t3 = $[1];
        t4 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t3, t4);
    let t5;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__pie$3e$__["pie"]().value(1).sort(null).startAngle(0).endAngle(2 * Math.PI).padAngle(PAD_ANGLE);
        $[3] = t5;
    } else {
        t5 = $[3];
    }
    const pie = t5;
    let t6;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = pie(MENU_ITEMS);
        $[4] = t6;
    } else {
        t6 = $[4];
    }
    const arcs = t6;
    const makeArc = _CompassMenuMakeArc;
    const getSubArcs = _CompassMenuGetSubArcs;
    let t7;
    if ($[5] !== selectedIndex) {
        t7 = ({
            "CompassMenu[handleSliceClick]": (idx)=>{
                if (selectedIndex === idx) {
                    setSelectedIndex(null);
                    setActiveSub(null);
                } else {
                    setSelectedIndex(idx);
                    setActiveSub(null);
                }
            }
        })["CompassMenu[handleSliceClick]"];
        $[5] = selectedIndex;
        $[6] = t7;
    } else {
        t7 = $[6];
    }
    const handleSliceClick = t7;
    let t8;
    if ($[7] !== router) {
        t8 = ({
            "CompassMenu[handleSubClick]": (parentIdx, subIdx)=>{
                setActiveSub({
                    parent: parentIdx,
                    sub: subIdx
                });
                const sub = MENU_ITEMS[parentIdx].subs[subIdx];
                router.push(sub.href);
            }
        })["CompassMenu[handleSubClick]"];
        $[7] = router;
        $[8] = t8;
    } else {
        t8 = $[8];
    }
    const handleSubClick = t8;
    const activeLabel = activeSub !== null ? `${MENU_ITEMS[activeSub.parent].label} \u2192 ${MENU_ITEMS[activeSub.parent].subs[activeSub.sub].label}` : hoveredSub !== null ? `${MENU_ITEMS[hoveredSub.parent].label} \u2192 ${MENU_ITEMS[hoveredSub.parent].subs[hoveredSub.sub].label}` : hoveredIndex !== null ? MENU_ITEMS[hoveredIndex].label : selectedIndex !== null ? MENU_ITEMS[selectedIndex].label : null;
    const activeColor = hoveredSub !== null ? MENU_ITEMS[hoveredSub.parent].color : hoveredIndex !== null ? MENU_ITEMS[hoveredIndex].color : selectedIndex !== null ? MENU_ITEMS[selectedIndex].color : null;
    let t9;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            userSelect: "none",
            gap: 12
        };
        $[9] = t9;
    } else {
        t9 = $[9];
    }
    let t10;
    let t11;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = {
            overflow: "visible"
        };
        t11 = MENU_ITEMS.map(_CompassMenuMENU_ITEMSMap);
        $[10] = t10;
        $[11] = t11;
    } else {
        t10 = $[10];
        t11 = $[11];
    }
    let t12;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
            id: "shadow",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feDropShadow", {
                dx: "0",
                dy: "2",
                stdDeviation: "6",
                floodColor: "rgba(12,30,61,0.12)"
            }, void 0, false, {
                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                lineNumber: 410,
                columnNumber: 31
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 410,
            columnNumber: 11
        }, this);
        $[12] = t12;
    } else {
        t12 = $[12];
    }
    let t13;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
            children: [
                t11,
                t12,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("radialGradient", {
                    id: "centerGrad",
                    cx: "50%",
                    cy: "50%",
                    r: "50%",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                            offset: "0%",
                            stopColor: CARD_BG
                        }, void 0, false, {
                            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                            lineNumber: 417,
                            columnNumber: 85
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                            offset: "100%",
                            stopColor: MUTED_BG
                        }, void 0, false, {
                            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                            lineNumber: 417,
                            columnNumber: 125
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                    lineNumber: 417,
                    columnNumber: 27
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 417,
            columnNumber: 11
        }, this);
        $[13] = t13;
    } else {
        t13 = $[13];
    }
    let t14;
    let t15;
    let t16;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
            r: SUB_OUTER + 22,
            fill: "none",
            stroke: BORDER,
            strokeWidth: "0.5",
            strokeDasharray: "3 8",
            opacity: "0.5"
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 426,
            columnNumber: 11
        }, this);
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
            r: SUB_HOVER_OUTER + 32,
            fill: "none",
            stroke: BORDER,
            strokeWidth: "0.3",
            opacity: "0.3"
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 427,
            columnNumber: 11
        }, this);
        t16 = Array.from({
            length: 72
        }).map(_CompassMenuAnonymous);
        $[14] = t14;
        $[15] = t15;
        $[16] = t16;
    } else {
        t14 = $[14];
        t15 = $[15];
        t16 = $[16];
    }
    let t17;
    if ($[17] !== selectedIndex) {
        t17 = selectedIndex !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
            r: (SUB_INNER + EXPAND_OUTER) / 2,
            fill: "none",
            stroke: MENU_ITEMS[selectedIndex].color,
            opacity: 0.1,
            strokeWidth: "1",
            strokeDasharray: "2 4",
            style: {
                transition: "all 0.3s ease"
            }
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 441,
            columnNumber: 37
        }, this);
        $[17] = selectedIndex;
        $[18] = t17;
    } else {
        t17 = $[18];
    }
    let t18;
    if ($[19] !== activeSub?.parent || $[20] !== activeSub?.sub || $[21] !== handleSubClick || $[22] !== hoveredSub || $[23] !== selectedIndex) {
        t18 = selectedIndex !== null && (()=>{
            const parentItem = MENU_ITEMS[selectedIndex];
            const parentArc = arcs[selectedIndex];
            const subArcs = getSubArcs(parentArc, parentItem.subs.length);
            return subArcs.map({
                "CompassMenu[<anonymous> > subArcs.map()]": (subArcData, si)=>{
                    const isSubHovered = hoveredSub?.parent === selectedIndex && hoveredSub?.sub === si;
                    const isSubActive = activeSub?.parent === selectedIndex && activeSub?.sub === si;
                    const isSubExpanded = isSubHovered || isSubActive;
                    const isOtherSubHovered = hoveredSub !== null && !(hoveredSub.parent === selectedIndex && hoveredSub.sub === si);
                    const outerR = isSubExpanded ? SUB_HOVER_OUTER : SUB_OUTER;
                    const subPath = makeArc(SUB_INNER, outerR)(subArcData);
                    const centroid = makeArc(SUB_INNER, outerR).centroid(subArcData);
                    const sub_0 = parentItem.subs[si];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        onMouseEnter: {
                            "CompassMenu[<anonymous> > subArcs.map() > <g>.onMouseEnter]": ()=>setHoveredSub({
                                    parent: selectedIndex,
                                    sub: si
                                })
                        }["CompassMenu[<anonymous> > subArcs.map() > <g>.onMouseEnter]"],
                        onMouseLeave: {
                            "CompassMenu[<anonymous> > subArcs.map() > <g>.onMouseLeave]": ()=>setHoveredSub(null)
                        }["CompassMenu[<anonymous> > subArcs.map() > <g>.onMouseLeave]"],
                        onClick: {
                            "CompassMenu[<anonymous> > subArcs.map() > <g>.onClick]": (e_0)=>{
                                e_0.stopPropagation();
                                handleSubClick(selectedIndex, si);
                            }
                        }["CompassMenu[<anonymous> > subArcs.map() > <g>.onClick]"],
                        style: {
                            cursor: "pointer"
                        },
                        children: [
                            isSubExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: subPath,
                                fill: parentItem.color,
                                opacity: 0.08,
                                filter: `url(#glow-${selectedIndex})`,
                                style: {
                                    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                                lineNumber: 479,
                                columnNumber: 32
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: subPath,
                                fill: isSubExpanded ? parentItem.color : CARD_BG,
                                stroke: isSubExpanded ? parentItem.color : BORDER,
                                strokeWidth: isSubExpanded ? 1.5 : 0.75,
                                opacity: isOtherSubHovered && !isSubActive ? 0.45 : 1,
                                style: {
                                    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    filter: isSubExpanded ? `url(#glow-${selectedIndex})` : "url(#shadow)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                                lineNumber: 481,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LucideInSvg, {
                                Icon: sub_0.Icon,
                                x: centroid[0],
                                y: centroid[1] - 6,
                                size: isSubExpanded ? 18 : 15,
                                color: isSubExpanded ? "#fff" : parentItem.color,
                                opacity: isOtherSubHovered && !isSubActive ? 0.5 : 1
                            }, void 0, false, {
                                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                                lineNumber: 484,
                                columnNumber: 18
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                x: centroid[0],
                                y: centroid[1] + 12,
                                textAnchor: "middle",
                                dominantBaseline: "central",
                                fontSize: 7,
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                fill: isSubExpanded ? "#fff" : MUTED_FG,
                                opacity: isOtherSubHovered && !isSubActive ? 0.4 : 1,
                                style: {
                                    transition: "all 0.2s ease",
                                    pointerEvents: "none",
                                    textTransform: "uppercase"
                                },
                                children: sub_0.label
                            }, void 0, false, {
                                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                                lineNumber: 484,
                                columnNumber: 222
                            }, this)
                        ]
                    }, `sub-${si}`, true, {
                        fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                        lineNumber: 465,
                        columnNumber: 18
                    }, this);
                }
            }["CompassMenu[<anonymous> > subArcs.map()]"]);
        })();
        $[19] = activeSub?.parent;
        $[20] = activeSub?.sub;
        $[21] = handleSubClick;
        $[22] = hoveredSub;
        $[23] = selectedIndex;
        $[24] = t18;
    } else {
        t18 = $[24];
    }
    let t19;
    if ($[25] !== handleSliceClick || $[26] !== hoveredIndex || $[27] !== selectedIndex) {
        t19 = arcs.map({
            "CompassMenu[arcs.map()]": (arcData, i_2)=>{
                const isHovered = hoveredIndex === i_2;
                const isSelected = selectedIndex === i_2;
                const isExpanded = isHovered || isSelected;
                const isOtherSelected = selectedIndex !== null && selectedIndex !== i_2;
                const isOtherHovered = hoveredIndex !== null && hoveredIndex !== i_2;
                const outerR_0 = isExpanded ? EXPAND_OUTER : BASE_OUTER;
                const path = makeArc(BASE_INNER, outerR_0)(arcData);
                const centroid_0 = makeArc(BASE_INNER, outerR_0).centroid(arcData);
                const item_0 = MENU_ITEMS[i_2];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    onMouseEnter: {
                        "CompassMenu[arcs.map() > <g>.onMouseEnter]": ()=>setHoveredIndex(i_2)
                    }["CompassMenu[arcs.map() > <g>.onMouseEnter]"],
                    onMouseLeave: {
                        "CompassMenu[arcs.map() > <g>.onMouseLeave]": ()=>setHoveredIndex(null)
                    }["CompassMenu[arcs.map() > <g>.onMouseLeave]"],
                    onClick: {
                        "CompassMenu[arcs.map() > <g>.onClick]": ()=>handleSliceClick(i_2)
                    }["CompassMenu[arcs.map() > <g>.onClick]"],
                    style: {
                        cursor: "pointer"
                    },
                    children: [
                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: path,
                            fill: item_0.color,
                            opacity: 0.08,
                            filter: `url(#glow-${i_2})`,
                            style: {
                                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                            lineNumber: 522,
                            columnNumber: 27
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: path,
                            fill: isSelected ? item_0.color : isHovered ? lighten(item_0.color, 0.85) : CARD_BG,
                            stroke: isExpanded ? item_0.color : BORDER,
                            strokeWidth: isExpanded ? 1.5 : 0.75,
                            opacity: isOtherSelected && !isHovered ? 0.3 : isOtherHovered && !isSelected ? 0.55 : 1,
                            style: {
                                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                filter: isSelected ? `url(#glow-${i_2})` : "url(#shadow)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                            lineNumber: 524,
                            columnNumber: 17
                        }, this),
                        isHovered && !isSelected && (()=>{
                            const subArcs_0 = getSubArcs(arcData, item_0.subs.length);
                            return subArcs_0.map({
                                "CompassMenu[arcs.map() > <anonymous> > subArcs_0.map()]": (subArcData_0, si_0)=>{
                                    const midAngle = (subArcData_0.startAngle + subArcData_0.endAngle) / 2 - Math.PI / 2;
                                    const dr = EXPAND_OUTER + 10;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: Math.cos(midAngle) * dr,
                                        cy: Math.sin(midAngle) * dr,
                                        r: 2.5,
                                        fill: item_0.color,
                                        opacity: 0.5,
                                        style: {
                                            transition: "all 0.15s ease",
                                            transitionDelay: `${si_0 * 30}ms`,
                                            pointerEvents: "none"
                                        }
                                    }, `dot-${si_0}`, false, {
                                        fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                                        lineNumber: 533,
                                        columnNumber: 24
                                    }, this);
                                }
                            }["CompassMenu[arcs.map() > <anonymous> > subArcs_0.map()]"]);
                        })(),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LucideInSvg, {
                            Icon: item_0.Icon,
                            x: centroid_0[0] * 0.82,
                            y: centroid_0[1] * 0.82 + (isExpanded ? -2 : 0),
                            size: isExpanded ? 22 : 19,
                            color: isSelected ? "#fff" : isHovered ? item_0.color : isOtherSelected ? MUTED_FG : DEEP_BLUE,
                            opacity: isOtherSelected && !isHovered ? 0.3 : 1
                        }, void 0, false, {
                            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                            lineNumber: 540,
                            columnNumber: 16
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: centroid_0[0] * 0.82,
                            y: centroid_0[1] * 0.82 + 16,
                            textAnchor: "middle",
                            dominantBaseline: "central",
                            fontSize: 8,
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 700,
                            letterSpacing: "0.07em",
                            fill: isSelected ? "#ffffffcc" : isExpanded ? item_0.color : "transparent",
                            style: {
                                transition: "all 0.25s ease",
                                transitionDelay: isExpanded ? "0.05s" : "0s",
                                pointerEvents: "none",
                                textTransform: "uppercase"
                            },
                            children: item_0.label
                        }, void 0, false, {
                            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                            lineNumber: 540,
                            columnNumber: 298
                        }, this)
                    ]
                }, i_2, true, {
                    fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                    lineNumber: 514,
                    columnNumber: 16
                }, this);
            }
        }["CompassMenu[arcs.map()]"]);
        $[25] = handleSliceClick;
        $[26] = hoveredIndex;
        $[27] = selectedIndex;
        $[28] = t19;
    } else {
        t19 = $[28];
    }
    const t20 = selectedIndex !== null ? MENU_ITEMS[selectedIndex].color : BORDER;
    const t21 = selectedIndex !== null ? 2 : 1;
    const t22 = selectedIndex !== null ? 0.4 : 1;
    let t23;
    let t24;
    if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
        t23 = {
            transition: "all 0.3s ease",
            cursor: "pointer"
        };
        t24 = ({
            "CompassMenu[<circle>.onClick]": ()=>{
                setSelectedIndex(null);
                setActiveSub(null);
            }
        })["CompassMenu[<circle>.onClick]"];
        $[29] = t23;
        $[30] = t24;
    } else {
        t23 = $[29];
        t24 = $[30];
    }
    let t25;
    if ($[31] !== t20 || $[32] !== t21 || $[33] !== t22) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
            r: BASE_INNER - 5,
            fill: "url(#centerGrad)",
            stroke: t20,
            strokeWidth: t21,
            strokeOpacity: t22,
            filter: "url(#shadow)",
            style: t23,
            onClick: t24
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 579,
            columnNumber: 11
        }, this);
        $[31] = t20;
        $[32] = t21;
        $[33] = t22;
        $[34] = t25;
    } else {
        t25 = $[34];
    }
    const t26 = `rotate(${needleAngle}deg)`;
    let t27;
    if ($[35] !== t26) {
        t27 = {
            transition: "transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: t26,
            transformOrigin: "0 0"
        };
        $[35] = t26;
        $[36] = t27;
    } else {
        t27 = $[36];
    }
    const t28 = activeColor || SUMMIT;
    let t29;
    if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
        t29 = {
            transition: "fill 0.3s ease"
        };
        $[37] = t29;
    } else {
        t29 = $[37];
    }
    let t30;
    if ($[38] !== t28) {
        t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
            points: "28,0 10,-4.5 10,4.5",
            fill: t28,
            opacity: 0.85,
            style: t29
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 612,
            columnNumber: 11
        }, this);
        $[38] = t28;
        $[39] = t30;
    } else {
        t30 = $[39];
    }
    let t31;
    if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
        t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
            points: "-28,0 -10,-4.5 -10,4.5",
            fill: DEEP_BLUE,
            opacity: 0.15
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 620,
            columnNumber: 11
        }, this);
        $[40] = t31;
    } else {
        t31 = $[40];
    }
    let t32;
    if ($[41] !== t27 || $[42] !== t30) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
            style: t27,
            children: [
                t30,
                t31
            ]
        }, void 0, true, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 627,
            columnNumber: 11
        }, this);
        $[41] = t27;
        $[42] = t30;
        $[43] = t32;
    } else {
        t32 = $[43];
    }
    const t33 = activeColor || SUMMIT;
    let t34;
    if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
        t34 = {
            transition: "fill 0.3s ease"
        };
        $[44] = t34;
    } else {
        t34 = $[44];
    }
    let t35;
    if ($[45] !== t33) {
        t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
            r: "5",
            fill: t33,
            opacity: 0.75,
            style: t34
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 646,
            columnNumber: 11
        }, this);
        $[45] = t33;
        $[46] = t35;
    } else {
        t35 = $[46];
    }
    let t36;
    let t37;
    if ($[47] === Symbol.for("react.memo_cache_sentinel")) {
        t36 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
            r: "2",
            fill: CARD_BG
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 655,
            columnNumber: 11
        }, this);
        t37 = [
            {
                l: "N",
                a: -90
            },
            {
                l: "E",
                a: 0
            },
            {
                l: "S",
                a: 90
            },
            {
                l: "W",
                a: 180
            }
        ].map(_CompassMenuAnonymous2);
        $[47] = t36;
        $[48] = t37;
    } else {
        t36 = $[47];
        t37 = $[48];
    }
    let t38;
    if ($[49] !== t17 || $[50] !== t18 || $[51] !== t19 || $[52] !== t25 || $[53] !== t32 || $[54] !== t35) {
        t38 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
            transform: `translate(${CENTER},${CENTER})`,
            children: [
                t14,
                t15,
                t16,
                t17,
                t18,
                t19,
                t25,
                t32,
                t35,
                t36,
                t37
            ]
        }, void 0, true, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 677,
            columnNumber: 11
        }, this);
        $[49] = t17;
        $[50] = t18;
        $[51] = t19;
        $[52] = t25;
        $[53] = t32;
        $[54] = t35;
        $[55] = t38;
    } else {
        t38 = $[55];
    }
    let t39;
    if ($[56] !== size || $[57] !== t38) {
        t39 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            ref: svgRef,
            width: size,
            height: size,
            viewBox: `0 0 ${VIEWBOX} ${VIEWBOX}`,
            style: t10,
            children: [
                t13,
                t38
            ]
        }, void 0, true, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 690,
            columnNumber: 11
        }, this);
        $[56] = size;
        $[57] = t38;
        $[58] = t39;
    } else {
        t39 = $[58];
    }
    let t40;
    if ($[59] !== activeColor || $[60] !== activeLabel || $[61] !== showLabel) {
        t40 = showLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                height: 32,
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: activeLabel ? 1 : 0.35,
                transition: "opacity 0.2s ease"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: activeColor || BORDER,
                        transition: "all 0.2s ease",
                        boxShadow: activeColor ? `0 0 10px ${activeColor}50` : "none"
                    }
                }, void 0, false, {
                    fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                    lineNumber: 706,
                    columnNumber: 8
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        color: activeColor ? DEEP_BLUE : MUTED_FG,
                        fontSize: 11,
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        transition: "color 0.2s ease"
                    },
                    children: activeLabel || "click a section"
                }, void 0, false, {
                    fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                    lineNumber: 713,
                    columnNumber: 12
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 699,
            columnNumber: 24
        }, this);
        $[59] = activeColor;
        $[60] = activeLabel;
        $[61] = showLabel;
        $[62] = t40;
    } else {
        t40 = $[62];
    }
    let t41;
    if ($[63] !== t39 || $[64] !== t40) {
        t41 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t9,
            children: [
                t39,
                t40
            ]
        }, void 0, true, {
            fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
            lineNumber: 731,
            columnNumber: 11
        }, this);
        $[63] = t39;
        $[64] = t40;
        $[65] = t41;
    } else {
        t41 = $[65];
    }
    return t41;
}
_s(CompassMenu, "avj+VyCXSESHSLsTPAdtFNbExj0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = CompassMenu;
function _CompassMenuAnonymous2(t0) {
    const { l, a } = t0;
    const rad = a * Math.PI / 180;
    const r = BASE_INNER - 22;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
        x: Math.cos(rad) * r,
        y: Math.sin(rad) * r + 1,
        textAnchor: "middle",
        dominantBaseline: "central",
        fontSize: 7,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 800,
        fill: DEEP_BLUE,
        opacity: 0.2,
        letterSpacing: "0.05em",
        children: l
    }, l, false, {
        fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
        lineNumber: 747,
        columnNumber: 10
    }, this);
}
function _CompassMenuAnonymous(__0, i_1) {
    const angle = i_1 * 5 * Math.PI / 180;
    const r1 = SUB_OUTER + 10;
    const isMajor = i_1 % 6 === 0;
    const r2 = r1 + (isMajor ? 10 : 4);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
        x1: Math.cos(angle) * r1,
        y1: Math.sin(angle) * r1,
        x2: Math.cos(angle) * r2,
        y2: Math.sin(angle) * r2,
        stroke: DEEP_BLUE,
        opacity: isMajor ? 0.12 : 0.04,
        strokeWidth: isMajor ? 1 : 0.5
    }, `t-${i_1}`, false, {
        fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
        lineNumber: 754,
        columnNumber: 10
    }, this);
}
function _CompassMenuMENU_ITEMSMap(item, i_0) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
        id: `glow-${i_0}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feGaussianBlur", {
                stdDeviation: "7",
                result: "blur"
            }, void 0, false, {
                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                lineNumber: 757,
                columnNumber: 57
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feFlood", {
                floodColor: item.color,
                floodOpacity: "0.35"
            }, void 0, false, {
                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                lineNumber: 757,
                columnNumber: 106
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feComposite", {
                in2: "blur",
                operator: "in"
            }, void 0, false, {
                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                lineNumber: 757,
                columnNumber: 161
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMerge", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMergeNode", {}, void 0, false, {
                        fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                        lineNumber: 757,
                        columnNumber: 210
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMergeNode", {
                        in: "SourceGraphic"
                    }, void 0, false, {
                        fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                        lineNumber: 757,
                        columnNumber: 225
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
                lineNumber: 757,
                columnNumber: 201
            }, this)
        ]
    }, `glow-${i_0}`, true, {
        fileName: "[project]/apps/marketing/src/components/compass-menu.tsx",
        lineNumber: 757,
        columnNumber: 10
    }, this);
}
function _CompassMenuGetSubArcs(parentArcData, subCount) {
    const start = parentArcData.startAngle;
    const end = parentArcData.endAngle;
    const totalPad = SUB_PAD * (subCount - 1);
    const available = end - start - PAD_ANGLE - totalPad;
    const each = available / subCount;
    return Array.from({
        length: subCount
    }, {
        "CompassMenu[getSubArcs > Array.from()]": (_, i)=>({
                startAngle: start + PAD_ANGLE / 2 + i * (each + SUB_PAD),
                endAngle: start + PAD_ANGLE / 2 + i * (each + SUB_PAD) + each,
                data: {},
                index: i,
                value: 1,
                padAngle: SUB_PAD
            })
    }["CompassMenu[getSubArcs > Array.from()]"]);
}
function _CompassMenuMakeArc(inner, outer) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$d3$2d$shape$40$3$2e$2$2e$0$2f$node_modules$2f$d3$2d$shape$2f$src$2f$arc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__arc$3e$__["arc"]().innerRadius(inner).outerRadius(outer).cornerRadius(CORNER_RADIUS);
}
var _c, _c1;
__turbopack_context__.k.register(_c, "LucideInSvg");
__turbopack_context__.k.register(_c1, "CompassMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/marketing/src/components/compass-section.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompassSection",
    ()=>CompassSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_bba87d7111fefc510c53c3fc05c3bef9/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_bba87d7111fefc510c53c3fc05c3bef9/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$marketing$2f$src$2f$components$2f$compass$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/marketing/src/components/compass-menu.tsx [app-client] (ecmascript)");
"use client";
;
;
;
function CompassSection() {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(3);
    if ($[0] !== "346eb5d4ef3916a11bc59297abfa987406a05616e7e8adb58ed3318aa4316daf") {
        for(let $i = 0; $i < 3; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "346eb5d4ef3916a11bc59297abfa987406a05616e7e8adb58ed3318aa4316daf";
    }
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center mb-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-3xl md:text-4xl font-display font-black mb-4 uppercase tracking-tight text-deep-blue",
                    children: "Your Command Center"
                }, void 0, false, {
                    fileName: "[project]/apps/marketing/src/components/compass-section.tsx",
                    lineNumber: 15,
                    columnNumber: 44
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-16 h-1.5 bg-summit mx-auto mb-6"
                }, void 0, false, {
                    fileName: "[project]/apps/marketing/src/components/compass-section.tsx",
                    lineNumber: 15,
                    columnNumber: 174
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-slate-500 max-w-2xl mx-auto text-lg",
                    children: "Everything you need, one click away. Explore the platform by navigating the compass."
                }, void 0, false, {
                    fileName: "[project]/apps/marketing/src/components/compass-section.tsx",
                    lineNumber: 15,
                    columnNumber: 227
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/marketing/src/components/compass-section.tsx",
            lineNumber: 15,
            columnNumber: 10
        }, this);
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "py-24 bg-glacier border-y border-slate-200 overflow-hidden",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                children: [
                    t0,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$marketing$2f$src$2f$components$2f$compass$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CompassMenu"], {
                            size: 1020
                        }, void 0, false, {
                            fileName: "[project]/apps/marketing/src/components/compass-section.tsx",
                            lineNumber: 22,
                            columnNumber: 187
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/marketing/src/components/compass-section.tsx",
                        lineNumber: 22,
                        columnNumber: 150
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/marketing/src/components/compass-section.tsx",
                lineNumber: 22,
                columnNumber: 90
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/marketing/src/components/compass-section.tsx",
            lineNumber: 22,
            columnNumber: 10
        }, this);
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    return t1;
}
_c = CompassSection;
var _c;
__turbopack_context__.k.register(_c, "CompassSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_marketing_src_components_69d69dde._.js.map