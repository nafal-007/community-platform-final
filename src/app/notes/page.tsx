import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DailyNotesClient from "./DailyNotesClient";

export default async function NotesPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login?callbackUrl=/notes");
    }

    // Fetch ALL user's notes, ordered by newest first
    const pastNotes = await prisma.dailyNote.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: { date: 'desc' }
    });

    return (
        <div className="w-full h-full p-6">
            <DailyNotesClient
                pastNotes={pastNotes}
            />
        </div>
    );
}
