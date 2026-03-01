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

        const joinedCommunities = await prisma.communityMember.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                community: true
            },
            orderBy: {
                community: {
                    name: "asc"
                }
            }
        });

        return NextResponse.json(joinedCommunities, { status: 200 });
    } catch (error) {
        console.error("FETCH_JOINED_COMMUNITIES_ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
