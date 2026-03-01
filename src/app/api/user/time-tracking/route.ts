import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const usage = await prisma.dailyUsage.findUnique({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
        });

        return NextResponse.json({ totalSecondsToday: usage?.secondsSpent || 0 });
    } catch (error) {
        console.error("Error fetching daily usage:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { seconds } = await req.json();

        if (typeof seconds !== "number" || seconds <= 0) {
            return NextResponse.json({ message: "Invalid seconds" }, { status: 400 });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const usage = await prisma.dailyUsage.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
            update: {
                secondsSpent: { increment: seconds },
            },
            create: {
                userId: session.user.id,
                date: today,
                secondsSpent: seconds,
            },
        });

        return NextResponse.json({ totalSecondsToday: usage.secondsSpent });
    } catch (error) {
        console.error("Error updating daily usage:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
