import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import {
  getUserConversations,
  getConversation,
  deleteConversation,
  updateConversation,
  getConversationMessages,
} from "@ascenta/db/conversations";

/**
 * GET - List conversations for a user or get a specific conversation
 */
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId") || "anonymous";

    if (id) {
      // Get specific conversation with messages
      const conversation = await getConversation(id);
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      const messages = await getConversationMessages(id);

      return NextResponse.json({
        conversation,
        messages,
      });
    }

    // List all conversations for user
    const conversations = await getUserConversations(userId);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversations" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a conversation (title, model, etc.)
 */
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, title, model, provider, systemPrompt } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const existing = await getConversation(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const updated = await updateConversation(id, {
      title,
      model,
      provider,
      systemPrompt,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update conversation error:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a conversation
 */
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const existing = await getConversation(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    await deleteConversation(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
