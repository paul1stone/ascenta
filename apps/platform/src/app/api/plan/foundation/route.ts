import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { foundationFormSchema } from "@/lib/validations/foundation";
import { getServerUser } from "@/lib/auth/server";

export async function GET() {
  try {
    await connectDB();
    const doc = await CompanyFoundation.findOne();
    if (!doc) {
      return NextResponse.json({ success: true, foundation: null });
    }
    return NextResponse.json({ success: true, foundation: doc.toJSON() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Foundation GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch foundation" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (user?.role !== "hr") {
      return NextResponse.json(
        { success: false, error: "Only HR can edit company foundation" },
        { status: 403 },
      );
    }
    await connectDB();
    const body = await req.json();
    const parsed = foundationFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const doc = await CompanyFoundation.findOneAndUpdate(
      {},
      { $set: parsed.data },
      { upsert: true, new: true, runValidators: true },
    );

    return NextResponse.json({ success: true, foundation: doc.toJSON() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Foundation POST error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to save foundation" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (user?.role !== "hr") {
      return NextResponse.json(
        { success: false, error: "Only HR can publish company foundation" },
        { status: 403 },
      );
    }
    await connectDB();
    const body = await req.json();
    const { action } = body;

    if (action === "publish") {
      const doc = await CompanyFoundation.findOneAndUpdate(
        {},
        { $set: { status: "published", publishedAt: new Date() } },
        { new: true },
      );
      if (!doc) {
        return NextResponse.json(
          { success: false, error: "No foundation document exists" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, foundation: doc.toJSON() });
    }

    if (action === "unpublish") {
      const doc = await CompanyFoundation.findOneAndUpdate(
        {},
        { $set: { status: "draft" } },
        { new: true },
      );
      if (!doc) {
        return NextResponse.json(
          { success: false, error: "No foundation document exists" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, foundation: doc.toJSON() });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'publish' or 'unpublish'." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Foundation PATCH error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update foundation status" },
      { status: 500 },
    );
  }
}
