import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const notes = await prisma.dailyNote.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json({ notes });
    } catch (error: any) {
        console.error("GET_NOTES_ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id, content, title } = await req.json();

        if (content === undefined || typeof content !== 'string') {
            return NextResponse.json({ message: "Content is required" }, { status: 400 });
        }

        let note;

        // If an ID is provided, UPDATE the existing note
        if (id) {
            note = await prisma.dailyNote.update({
                where: { id, userId: session.user.id },
                data: {
                    rawContent: content,
                    ...(title && { title })
                }
            });
        }
        // Otherwise, CREATE a completely new note
        else {
            // Generate a default title if not provided
            const fallbackTitle = title || `Note - ${new Date().toLocaleDateString()}`;
            note = await prisma.dailyNote.create({
                data: {
                    userId: session.user.id,
                    rawContent: content,
                    title: fallbackTitle
                }
            });
        }

        return NextResponse.json({ message: "Note saved successfully", note }, { status: 200 });

    } catch (error: any) {
        console.error("POST_NOTE_ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
