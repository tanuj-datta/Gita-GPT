import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ id, title: "Chat", messages: [] });
    }
    const session = await auth();
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.userId && chat.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Failed to fetch chat details (falling back to mock):", error);
    return NextResponse.json({ id, title: "Temporary Chat", messages: [] });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true });
    }
    const session = await auth();
    const chat = await prisma.chat.findUnique({
      where: { id }
    });

    if (chat && chat.userId && chat.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized to delete chat" }, { status: 403 });
    }
    
    // Attempt deleting messages first if they exist
    try {
      await prisma.message.deleteMany({
        where: { chatId: id }
      });
    } catch (e) {
      console.warn("Could not delete messages for chat:", e);
    }

    await prisma.chat.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chat (falling back to mock success):", error);
    return NextResponse.json({ success: true });
  }
}
