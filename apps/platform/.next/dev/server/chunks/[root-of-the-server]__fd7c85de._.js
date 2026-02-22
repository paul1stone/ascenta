module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/packages/db/src/employee-schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "employeeNotes",
    ()=>employeeNotes,
    "employees",
    ()=>employees
]);
/**
 * Employee and Employee Notes Schema
 * Used for employee lookup during conversational workflows
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/uuid.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/jsonb.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/indexes.js [app-route] (ecmascript)");
;
const employees = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("employees", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    employeeId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("employee_id").notNull().unique(),
    firstName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("first_name").notNull(),
    lastName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("last_name").notNull(),
    email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("email").notNull().unique(),
    department: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("department").notNull(),
    jobTitle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("job_title").notNull(),
    managerName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("manager_name").notNull(),
    hireDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("hire_date").notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").default("active").notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("employees_employee_id_idx").on(table.employeeId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("employees_name_idx").on(table.firstName, table.lastName),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("employees_email_idx").on(table.email),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("employees_department_idx").on(table.department)
    ]);
const employeeNotes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("employee_notes", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    employeeId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("employee_id").references(()=>employees.id, {
        onDelete: "cascade"
    }).notNull(),
    noteType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("note_type").notNull(),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("title").notNull(),
    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("content"),
    severity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("severity"),
    occurredAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("occurred_at").notNull(),
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("employee_notes_employee_id_idx").on(table.employeeId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("employee_notes_type_idx").on(table.noteType)
    ]);
}),
"[project]/packages/db/src/workflow-schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TRACKED_DOCUMENT_STAGES",
    ()=>TRACKED_DOCUMENT_STAGES,
    "artifactTemplates",
    ()=>artifactTemplates,
    "auditEvents",
    ()=>auditEvents,
    "guardrails",
    ()=>guardrails,
    "guidedActions",
    ()=>guidedActions,
    "intakeFields",
    ()=>intakeFields,
    "textLibraries",
    ()=>textLibraries,
    "trackedDocuments",
    ()=>trackedDocuments,
    "workflowDefinitions",
    ()=>workflowDefinitions,
    "workflowOutputs",
    ()=>workflowOutputs,
    "workflowRuns",
    ()=>workflowRuns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/uuid.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/jsonb.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/indexes.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/integer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/employee-schema.ts [app-route] (ecmascript)");
;
;
const workflowDefinitions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("workflow_definitions", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    // Unique identifier for code-defined workflows (e.g., "written-warning")
    slug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("slug").notNull().unique(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("description"),
    category: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("category").notNull(),
    audience: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("audience").notNull(),
    riskLevel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("risk_level").notNull(),
    version: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("version").default(1).notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("is_active").default(true).notNull(),
    estimatedMinutes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("estimated_minutes"),
    // JSON for flexible metadata (icons, colors, etc.)
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("workflow_definitions_slug_idx").on(table.slug),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("workflow_definitions_category_idx").on(table.category)
    ]);
const intakeFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("intake_fields", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    workflowDefinitionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_definition_id").references(()=>workflowDefinitions.id, {
        onDelete: "cascade"
    }).notNull(),
    // Field configuration
    fieldKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("field_key").notNull(),
    label: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("label").notNull(),
    type: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("type").notNull(),
    placeholder: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("placeholder"),
    helpText: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("help_text"),
    // Validation
    required: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("required").default(false).notNull(),
    validationRules: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("validation_rules"),
    // For dropdown/checkbox_group types
    options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("options"),
    // Ordering and grouping
    sortOrder: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("sort_order").default(0).notNull(),
    groupName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("group_name"),
    // Conditional display
    conditionalOn: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("conditional_on"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("intake_fields_workflow_id_idx").on(table.workflowDefinitionId)
    ]);
const guardrails = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("guardrails", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    workflowDefinitionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_definition_id").references(()=>workflowDefinitions.id, {
        onDelete: "cascade"
    }).notNull(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("description"),
    // Rule definition (evaluated as code, not AI)
    // Format: { field: string, operator: string, value: any, and?: Rule[], or?: Rule[] }
    triggerCondition: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("trigger_condition").notNull(),
    // Outcome
    severity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("severity").notNull(),
    message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("message").notNull(),
    requiredAction: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("required_action"),
    // For escalations
    escalateTo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("escalate_to"),
    // Ordering
    sortOrder: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("sort_order").default(0).notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("is_active").default(true).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("guardrails_workflow_id_idx").on(table.workflowDefinitionId)
    ]);
const artifactTemplates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("artifact_templates", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    workflowDefinitionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_definition_id").references(()=>workflowDefinitions.id, {
        onDelete: "cascade"
    }).notNull(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    type: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("type").notNull(),
    // Template sections - array of { key, title, locked, content?, aiPrompt? }
    sections: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("sections").notNull(),
    // Export configuration
    exportFormats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("export_formats"),
    // Metadata
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("artifact_templates_workflow_id_idx").on(table.workflowDefinitionId)
    ]);
const textLibraries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("text_libraries", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    category: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("category").notNull(),
    key: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("key").notNull(),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("title").notNull(),
    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("content").notNull(),
    // Optional association with specific workflows
    workflowDefinitionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_definition_id").references(()=>workflowDefinitions.id, {
        onDelete: "set null"
    }),
    // Metadata
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    isActive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("is_active").default(true).notNull(),
    sortOrder: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("sort_order").default(0).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("text_libraries_category_idx").on(table.category),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("text_libraries_workflow_id_idx").on(table.workflowDefinitionId)
    ]);
const workflowRuns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("workflow_runs", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    workflowDefinitionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_definition_id").references(()=>workflowDefinitions.id).notNull(),
    workflowVersion: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("workflow_version").notNull(),
    // User info
    userId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("user_id").notNull(),
    // Immutable snapshot of inputs at each step
    inputsSnapshot: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("inputs_snapshot").notNull(),
    // Current state
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull(),
    currentStep: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("current_step").default("intake").notNull(),
    // Guardrail results
    guardrailsTriggered: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("guardrails_triggered"),
    // Review info
    reviewerId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("reviewer_id"),
    reviewedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("reviewed_at"),
    reviewNotes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("review_notes"),
    // Timestamps
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull(),
    completedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("completed_at")
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("workflow_runs_workflow_id_idx").on(table.workflowDefinitionId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("workflow_runs_user_id_idx").on(table.userId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("workflow_runs_status_idx").on(table.status)
    ]);
const workflowOutputs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("workflow_outputs", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    workflowRunId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_run_id").references(()=>workflowRuns.id, {
        onDelete: "cascade"
    }).notNull(),
    artifactTemplateId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("artifact_template_id").references(()=>artifactTemplates.id),
    // Version tracking
    version: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("version").default(1).notNull(),
    // Content
    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("content").notNull(),
    renderedContent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("rendered_content"),
    // Export info
    exportedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("exported_at"),
    exportFormat: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("export_format"),
    exportUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("export_url"),
    // Hashes for audit integrity
    contentHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("content_hash"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("workflow_outputs_run_id_idx").on(table.workflowRunId)
    ]);
const auditEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("audit_events", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    workflowRunId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_run_id").references(()=>workflowRuns.id, {
        onDelete: "cascade"
    }).notNull(),
    // Actor information
    actorId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("actor_id").notNull(),
    actorType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("actor_type").notNull(),
    // Event details
    action: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("action").notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("description"),
    // Integrity hashes
    inputHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("input_hash"),
    outputHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("output_hash"),
    // Additional context
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    rationale: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("rationale"),
    // Version tracking
    workflowVersion: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("workflow_version").notNull(),
    // Timestamp (immutable)
    timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("timestamp").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("audit_events_run_id_idx").on(table.workflowRunId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("audit_events_actor_id_idx").on(table.actorId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("audit_events_action_idx").on(table.action),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("audit_events_timestamp_idx").on(table.timestamp)
    ]);
const guidedActions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("guided_actions", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    workflowDefinitionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_definition_id").references(()=>workflowDefinitions.id, {
        onDelete: "cascade"
    }).notNull(),
    // Action definition
    label: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("label").notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("description"),
    icon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("icon"),
    // Required inputs before this action can run
    requiredInputs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("required_inputs"),
    // Output configuration
    outputType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("output_type").notNull(),
    outputTarget: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("output_target"),
    // AI prompt template (uses {{fieldKey}} placeholders)
    promptTemplate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("prompt_template").notNull(),
    // Ordering
    sortOrder: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("sort_order").default(0).notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("is_active").default(true).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("guided_actions_workflow_id_idx").on(table.workflowDefinitionId)
    ]);
const TRACKED_DOCUMENT_STAGES = [
    "draft",
    "on_us_to_send",
    "sent",
    "in_review",
    "acknowledged",
    "completed"
];
const trackedDocuments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("tracked_documents", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    workflowRunId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_run_id").references(()=>workflowRuns.id, {
        onDelete: "cascade"
    }).notNull(),
    workflowOutputId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("workflow_output_id").references(()=>workflowOutputs.id, {
        onDelete: "set null"
    }),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("title").notNull(),
    documentType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("document_type").notNull().default("corrective_action"),
    employeeName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("employee_name"),
    /** Link to employees.id so we can update employee file (notes) and query by employee */ employeeId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("employee_id").references(()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].id, {
        onDelete: "set null"
    }),
    stage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("stage").notNull().default("draft"),
    /** Which action items are done: { "sent_email": true, "scheduled_meeting": true } */ completedActions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("completed_actions").default({}),
    /** Recipient email for automated delivery */ employeeEmail: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("employee_email"),
    /** When the document email was sent */ sentAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("sent_at"),
    /** When the employee acknowledged receipt */ acknowledgedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("acknowledged_at"),
    /** HMAC token for stateless acknowledgment verification */ ackToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("ack_token"),
    /** When the last reminder was sent */ reminderSentAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("reminder_sent_at"),
    /** Number of reminders sent */ reminderCount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("reminder_count").default(0).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("tracked_documents_workflow_run_idx").on(table.workflowRunId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("tracked_documents_stage_idx").on(table.stage),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("tracked_documents_employee_id_idx").on(table.employeeId)
    ]);
}),
"[project]/packages/db/src/demo-requests-schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "demoRequests",
    ()=>demoRequests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/uuid.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
;
const demoRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("demo_requests", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    firstName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("first_name").notNull(),
    lastName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("last_name").notNull(),
    email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("email").notNull(),
    company: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("company").notNull(),
    role: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("role").notNull(),
    employeeCount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("employee_count").notNull(),
    phone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("phone"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull()
});
}),
"[project]/packages/db/src/schema.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "conversations",
    ()=>conversations,
    "documents",
    ()=>documents,
    "embeddings",
    ()=>embeddings,
    "messages",
    ()=>messages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/uuid.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/jsonb.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/indexes.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$vector_extension$2f$vector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.js [app-route] (ecmascript)");
// Re-export workflow schema
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/workflow-schema.ts [app-route] (ecmascript)");
// Re-export employee schema
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/employee-schema.ts [app-route] (ecmascript)");
// Re-export demo requests schema
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$demo$2d$requests$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/demo-requests-schema.ts [app-route] (ecmascript)");
;
const conversations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("conversations", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    userId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("user_id").notNull(),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("title"),
    model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("model").default("gpt-4o"),
    provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("provider").default("openai"),
    systemPrompt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("system_prompt"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("conversations_user_id_idx").on(table.userId)
    ]);
const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("messages", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    conversationId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("conversation_id").references(()=>conversations.id, {
        onDelete: "cascade"
    }).notNull(),
    role: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("role").notNull(),
    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("content").notNull(),
    toolCalls: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("tool_calls"),
    toolCallId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("tool_call_id"),
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("messages_conversation_id_idx").on(table.conversationId)
    ]);
const documents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("documents", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("title"),
    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("content"),
    source: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("source"),
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const embeddings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("embeddings", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    documentId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("document_id").references(()=>documents.id, {
        onDelete: "cascade"
    }).notNull(),
    chunkIndex: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("chunk_index"),
    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("content").notNull(),
    embedding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$vector_extension$2f$vector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["vector"])("embedding", {
        dimensions: 1536
    }),
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("embeddings_document_id_idx").on(table.documentId)
    ]);
;
;
;
}),
"[project]/packages/db/src/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TRACKED_DOCUMENT_STAGES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRACKED_DOCUMENT_STAGES"],
    "artifactTemplates",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["artifactTemplates"],
    "auditEvents",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auditEvents"],
    "conversations",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["conversations"],
    "demoRequests",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$demo$2d$requests$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demoRequests"],
    "documents",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["documents"],
    "embeddings",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["embeddings"],
    "employeeNotes",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"],
    "employees",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"],
    "guardrails",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["guardrails"],
    "guidedActions",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["guidedActions"],
    "intakeFields",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["intakeFields"],
    "messages",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["messages"],
    "textLibraries",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["textLibraries"],
    "trackedDocuments",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"],
    "workflowDefinitions",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowDefinitions"],
    "workflowOutputs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"],
    "workflowRuns",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowRuns"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/db/src/schema.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/workflow-schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/employee-schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$demo$2d$requests$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/demo-requests-schema.ts [app-route] (ecmascript)");
}),
"[project]/packages/db/src/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$neondatabase$2b$serverless$40$1$2e$0$2e$2$2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@neondatabase+serverless@1.0.2/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$neon$2d$http$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/neon-http/driver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/db/src/schema.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/schema.ts [app-route] (ecmascript)");
;
;
;
// Lazy initialization - only connect when first used
let sql = null;
let _db = null;
function getDb() {
    if (!_db) {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL environment variable is not set. Please configure your database connection.");
        }
        sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$neondatabase$2b$serverless$40$1$2e$0$2e$2$2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(process.env.DATABASE_URL);
        _db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$neon$2d$http$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["drizzle"])(sql, {
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
        });
    }
    return _db;
}
const db = new Proxy({}, {
    get (_, prop) {
        const instance = getDb();
        const value = instance[prop];
        if (typeof value === "function") {
            return value.bind(instance);
        }
        return value;
    }
});
;
}),
"[project]/packages/db/src/employees.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addEmployeeNote",
    ()=>addEmployeeNote,
    "getEmployeeByEmployeeId",
    ()=>getEmployeeByEmployeeId,
    "getEmployeeById",
    ()=>getEmployeeById,
    "searchEmployees",
    ()=>searchEmployees
]);
/**
 * Employee data access layer
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/db/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/employee-schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/sql/expressions/select.js [app-route] (ecmascript)");
;
;
;
async function searchEmployees(query) {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const term = `%${trimmed}%`;
    const words = trimmed.split(/\s+/).filter(Boolean);
    // Build conditions: single word OR "First Last" (firstName AND lastName)
    const conditions = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ilike"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].firstName, term),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ilike"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].lastName, term),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ilike"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].email, term),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ilike"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].employeeId, term)
    ];
    // For "First Last", match firstName AND lastName (e.g. "Brandon White")
    if (words.length >= 2) {
        const firstWord = `%${words[0]}%`;
        const lastWord = `%${words[words.length - 1]}%`;
        const combined = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ilike"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].firstName, firstWord), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ilike"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].lastName, lastWord));
        if (combined) {
            conditions.push(combined);
        }
    }
    const results = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["or"])(...conditions)).limit(10);
    const withNotes = [];
    for (const emp of results){
        const notes = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].id,
            noteType: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].noteType,
            title: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].title,
            content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].content,
            severity: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].severity,
            occurredAt: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].occurredAt
        }).from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].employeeId, emp.id)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].occurredAt));
        withNotes.push({
            id: emp.id,
            employeeId: emp.employeeId,
            firstName: emp.firstName,
            lastName: emp.lastName,
            fullName: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            department: emp.department,
            jobTitle: emp.jobTitle,
            managerName: emp.managerName,
            hireDate: emp.hireDate,
            notes: notes.map((n)=>({
                    id: n.id,
                    noteType: n.noteType,
                    title: n.title,
                    content: n.content,
                    severity: n.severity,
                    occurredAt: n.occurredAt
                }))
        });
    }
    return withNotes;
}
async function getEmployeeByEmployeeId(employeeIdText) {
    const [emp] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].employeeId, employeeIdText.trim())).limit(1);
    if (!emp) return null;
    const notes = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].id,
        noteType: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].noteType,
        title: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].title,
        content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].content,
        severity: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].severity,
        occurredAt: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].occurredAt
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].employeeId, emp.id)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].occurredAt));
    return {
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        fullName: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        department: emp.department,
        jobTitle: emp.jobTitle,
        managerName: emp.managerName,
        hireDate: emp.hireDate,
        notes: notes.map((n)=>({
                id: n.id,
                noteType: n.noteType,
                title: n.title,
                content: n.content,
                severity: n.severity,
                occurredAt: n.occurredAt
            }))
    };
}
async function getEmployeeById(id) {
    const [emp] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employees"].id, id)).limit(1);
    if (!emp) return null;
    const notes = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].id,
        noteType: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].noteType,
        title: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].title,
        content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].content,
        severity: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].severity,
        occurredAt: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].occurredAt
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].employeeId, emp.id)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].occurredAt));
    return {
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        fullName: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        department: emp.department,
        jobTitle: emp.jobTitle,
        managerName: emp.managerName,
        hireDate: emp.hireDate,
        notes: notes.map((n)=>({
                id: n.id,
                noteType: n.noteType,
                title: n.title,
                content: n.content,
                severity: n.severity,
                occurredAt: n.occurredAt
            }))
    };
}
async function addEmployeeNote(employeeId, data) {
    const [note] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"]).values({
        employeeId,
        noteType: data.noteType,
        title: data.title,
        content: data.content ?? null,
        severity: data.severity ?? null,
        occurredAt: data.occurredAt ?? new Date(),
        metadata: data.metadata ?? null
    }).returning({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employee$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["employeeNotes"].id
    });
    if (!note) throw new Error("Failed to add employee note");
    return note;
}
}),
"[project]/packages/db/src/tracked-documents.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTrackedDocument",
    ()=>createTrackedDocument,
    "getLatestOutputIdForRun",
    ()=>getLatestOutputIdForRun,
    "getTrackedDocument",
    ()=>getTrackedDocument,
    "getTrackedDocumentByRunId",
    ()=>getTrackedDocumentByRunId,
    "getTrackedDocumentWithContent",
    ()=>getTrackedDocumentWithContent,
    "listTrackedDocuments",
    ()=>listTrackedDocuments,
    "updateCompletedActions",
    ()=>updateCompletedActions,
    "updateTrackedDocumentStage",
    ()=>updateTrackedDocumentStage,
    "upsertTrackedDocumentForRun",
    ()=>upsertTrackedDocumentForRun
]);
/**
 * Tracked documents - progress pipeline (Kanban)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/db/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employees$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/employees.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/workflow-schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/drizzle-orm@0.45.1_@neondatabase+serverless@1.0.2_@opentelemetry+api@1.9.0_@types+pg@8.16.0/node_modules/drizzle-orm/sql/expressions/select.js [app-route] (ecmascript)");
;
;
;
;
/** Safely parse completedActions JSON column into a typed record */ function parseCompletedActions(value) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    return {};
}
async function createTrackedDocument(data) {
    const [doc] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).values({
        ...data,
        updatedAt: new Date()
    }).returning({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id,
        workflowRunId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].workflowRunId,
        stage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].stage
    });
    if (!doc) throw new Error("Failed to create tracked document");
    return doc;
}
async function getTrackedDocument(id) {
    const [doc] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id, id)).limit(1);
    return doc ?? null;
}
async function getTrackedDocumentWithContent(id) {
    const [doc] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id, id)).limit(1);
    if (!doc) return null;
    let renderedContent = null;
    if (doc.workflowOutputId) {
        const [out] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select({
            renderedContent: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"].renderedContent
        }).from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"].id, doc.workflowOutputId)).limit(1);
        renderedContent = out?.renderedContent ?? null;
    }
    if (!renderedContent && doc.workflowRunId) {
        const [out] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select({
            renderedContent: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"].renderedContent
        }).from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"].workflowRunId, doc.workflowRunId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"].version)).limit(1);
        renderedContent = out?.renderedContent ?? null;
    }
    return {
        ...doc,
        renderedContent,
        completedActions: parseCompletedActions(doc.completedActions)
    };
}
async function getTrackedDocumentByRunId(workflowRunId) {
    const [doc] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].workflowRunId, workflowRunId)).limit(1);
    return doc ?? null;
}
async function upsertTrackedDocumentForRun(params) {
    const outputId = await getLatestOutputIdForRun(params.workflowRunId);
    const existing = await getTrackedDocumentByRunId(params.workflowRunId);
    let employeeUuid = null;
    if (params.employeeId) {
        const emp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employees$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEmployeeByEmployeeId"])(params.employeeId);
        employeeUuid = emp?.id ?? null;
    }
    if (existing) {
        const [updated] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).set({
            title: params.title,
            employeeName: params.employeeName ?? existing.employeeName,
            workflowOutputId: outputId ?? existing.workflowOutputId,
            updatedAt: new Date()
        }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id, existing.id)).returning({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id,
            stage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].stage
        });
        if (!updated) throw new Error("Failed to update tracked document");
        if (employeeUuid) {
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).set({
                    employeeId: employeeUuid,
                    updatedAt: new Date()
                }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id, existing.id));
            } catch (err) {
                console.warn("Tracked document: could not set employeeId", err);
            }
        }
        return updated;
    }
    // Create document without employeeId first so generation succeeds even if migration not applied
    const created = await createTrackedDocument({
        workflowRunId: params.workflowRunId,
        workflowOutputId: outputId,
        title: params.title,
        documentType: params.documentType ?? "corrective_action",
        employeeName: params.employeeName ?? null,
        stage: "on_us_to_send"
    });
    // Best-effort: link to employee and add note (skip if column missing or note fails)
    if (employeeUuid && params.documentType === "corrective_action") {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).set({
                employeeId: employeeUuid,
                updatedAt: new Date()
            }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id, created.id));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$employees$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addEmployeeNote"])(employeeUuid, {
                noteType: "written_warning",
                title: params.title,
                metadata: {
                    trackedDocumentId: created.id
                }
            });
        } catch (err) {
            console.warn("Tracked document: could not link employee or add note", err);
        }
    }
    return {
        id: created.id,
        stage: created.stage
    };
}
async function listTrackedDocuments() {
    const docs = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id,
        workflowRunId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].workflowRunId,
        title: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].title,
        documentType: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].documentType,
        employeeName: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].employeeName,
        employeeId: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].employeeId,
        stage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].stage,
        completedActions: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].completedActions,
        createdAt: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].createdAt,
        updatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].updatedAt
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].updatedAt));
    return docs.map((d)=>({
            ...d,
            completedActions: parseCompletedActions(d.completedActions)
        }));
}
async function updateCompletedActions(id, completedActions) {
    const [updated] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).set({
        completedActions,
        updatedAt: new Date()
    }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id, id)).returning({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id
    });
    return updated ?? null;
}
async function updateTrackedDocumentStage(id, stage) {
    const [updated] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"]).set({
        stage,
        updatedAt: new Date()
    }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id, id)).returning({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].id,
        stage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackedDocuments"].stage
    });
    return updated ?? null;
}
async function getLatestOutputIdForRun(workflowRunId) {
    const [out] = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"].id
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"].workflowRunId, workflowRunId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$drizzle$2d$orm$40$0$2e$45$2e$1_$40$neondatabase$2b$serverless$40$1$2e$0$2e$2_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$types$2b$pg$40$8$2e$16$2e$0$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$workflow$2d$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workflowOutputs"].version)).limit(1);
    return out?.id ?? null;
}
}),
"[project]/apps/platform/src/app/api/tracked-documents/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_@babel+core@7.29.0_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0_bba87d7111fefc510c53c3fc05c3bef9/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$tracked$2d$documents$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/tracked-documents.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const documents = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$tracked$2d$documents$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listTrackedDocuments"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(documents);
    } catch (error) {
        console.error("List tracked documents error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_$40$babel$2b$core$40$7$2e$29$2e$0_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0_bba87d7111fefc510c53c3fc05c3bef9$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to list documents"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fd7c85de._.js.map