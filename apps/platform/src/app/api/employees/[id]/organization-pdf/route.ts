import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { assembleOrgSnapshot } from "@/lib/pdf/assemble-org-snapshot";
import { renderOrgSnapshot } from "@/lib/pdf/render-org-snapshot";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const snapshot = await assembleOrgSnapshot(id);
    const buffer = await renderOrgSnapshot(snapshot);
    const filename = `${slugify(snapshot.employee.name) || "employee"}-organization-snapshot.pdf`;
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(message)) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
