import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([]);
    }
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Failed to fetch chats (falling back to empty list):", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  let requestData: any = {};
  try {
    requestData = await req.json().catch(() => ({}));
    const { title, language, customContext } = requestData;
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        id: `mock-chat-${Date.now()}`,
        title: title || "New Conversation",
        language: language || "English",
        customContext: customContext || "",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    const chat = await prisma.chat.create({
      data: {
        title: title || "New Conversation",
        language: language || "English",
        customContext: customContext || "",
      }
    });
    return NextResponse.json(chat);
  } catch (error) {
    console.error("Failed to create chat (falling back to mock):", error);
    const { title, language, customContext } = requestData;
    return NextResponse.json({
      id: `mock-chat-${Date.now()}`,
      title: title || "New Conversation",
      language: language || "English",
      customContext: customContext || "",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
