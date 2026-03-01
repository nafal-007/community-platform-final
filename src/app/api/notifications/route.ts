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

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                isRead: false
            }
        });

        return NextResponse.json({ notifications, unreadCount }, { status: 200 });

    } catch (error: any) {
        console.error("FETCH_NOTIFICATIONS_ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
