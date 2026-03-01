import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const notificationId = resolvedParams.id;

        // Verify ownership
        const notif = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notif || notif.userId !== session.user.id) {
            return NextResponse.json({ message: "Not found or forbidden" }, { status: 404 });
        }

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });

        return NextResponse.json(updated, { status: 200 });

    } catch (error: any) {
        console.error("UPDATE_NOTIFICATION_ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
