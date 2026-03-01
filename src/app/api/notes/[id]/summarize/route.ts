import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: noteId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Fetch the raw note
        const note = await prisma.dailyNote.findUnique({
            where: {
                id: noteId,
                userId: session.user.id,
            },
        });

        if (!note) {
            return NextResponse.json({ message: "Note not found" }, { status: 404 });
        }

        // If a summary already exists, just return the cached version to save tokens
        if (note.aiSummary) {
            return NextResponse.json({ summary: note.aiSummary });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ message: "Gemini API key is not configured" }, { status: 500 });
        }

        // Initialize Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `Summarize the following learning notes from a user into exactly 3 to 5 highly concise, impactful bullet points. Focus purely on extracting the core concepts, actionable takeaways, and structured knowledge. Do not include introductory or concluding filler. Use standard markdown for the bullet points.

CONTENT TO SUMMARIZE:
${note.rawContent}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const summary = response.text;

        // Cache the result in the database
        await prisma.dailyNote.update({
            where: { id: noteId },
            data: { aiSummary: summary },
        });

        return NextResponse.json({ summary });

    } catch (error: any) {
        console.error("Error summarizing note:", error);
        return NextResponse.json({ message: "Failed to generate summary", error: error.message }, { status: 500 });
    }
}
