import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";
import { regenerateRoleSection, type TranslationSection } from "@/lib/ai/translation-engine";
import { getServerUser } from "@/lib/auth/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await StrategyTranslation.findById(id).lean();
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Translation not found" },
        { status: 404 },
      );
    }

    const translation = doc as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      translation: {
        ...translation,
        id: String(translation._id),
        _id: undefined,
        __v: undefined,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy translation GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch translation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getServerUser(req);
    if (!user || user.role === "employee") {
      return NextResponse.json(
        { success: false, error: "Not authorized to edit translations" },
        { status: 403 },
      );
    }
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { action } = body as { action: string };

    const doc = await StrategyTranslation.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Translation not found" },
        { status: 404 },
      );
    }

    if (user.role === "manager" && doc.department !== user.department) {
      return NextResponse.json(
        { success: false, error: "Managers can only edit translations for their own department" },
        { status: 403 },
      );
    }

    if (action === "publish") {
      await StrategyTranslation.updateMany(
        { department: doc.department, status: "published" },
        { $set: { status: "archived" } },
      );

      doc.status = "published";
      await doc.save();

      return NextResponse.json({
        success: true,
        message: `Translation for ${doc.department} published (v${doc.version}).`,
      });
    }

    if (action === "archive") {
      doc.status = "archived";
      await doc.save();

      return NextResponse.json({
        success: true,
        message: "Translation archived.",
      });
    }

    if (action === "regenerateSection") {
      const { roleIndex, section } = body as {
        roleIndex: number;
        section: TranslationSection;
      };

      if (typeof roleIndex !== "number" || !["contributions", "behaviors", "decisionRights"].includes(section)) {
        return NextResponse.json(
          { success: false, error: "roleIndex (number) and section ('contributions' | 'behaviors' | 'decisionRights') are required" },
          { status: 400 },
        );
      }

      await regenerateRoleSection(id, roleIndex, section);

      return NextResponse.json({
        success: true,
        message: `Regenerated ${section} for role at index ${roleIndex}.`,
      });
    }

    if (body.roles) {
      doc.roles = body.roles;
      await doc.save();

      return NextResponse.json({
        success: true,
        message: "Translation roles updated.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'publish', 'archive', 'regenerateSection', or provide 'roles'." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy translation PATCH error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update translation" },
      { status: 500 },
    );
  }
}
