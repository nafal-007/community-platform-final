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

        const pendingRequests = await prisma.joinRequest.findMany({
            where: {
                status: "PENDING",
                community: {
                    members: {
                        some: {
                            userId: session.user.id,
                            role: "ADMIN"
                        }
                    }
                }
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true, username: true }
                },
                community: {
                    select: { id: true, name: true }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json(pendingRequests, { status: 200 });

    } catch (error: any) {
        console.error("FETCH_PENDING_REQUESTS_ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
