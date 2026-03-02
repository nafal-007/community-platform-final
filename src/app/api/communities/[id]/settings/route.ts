import { NextRequest, NextResponse } from "next/server";
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
        const communityId = resolvedParams.id;

        // Verify Admin Status
        const membership = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: session.user.id,
                    communityId: communityId
                }
            }
        });

        if (!membership || membership.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden. Only admins can edit settings." }, { status: 403 });
        }

        const { avatarUrl } = await req.json();

        // Update the community
        const updatedCommunity = await prisma.community.update({
            where: { id: communityId },
            data: {
                avatarUrl: avatarUrl || null
            }
        });

        return NextResponse.json({ message: "Community updated successfully", community: updatedCommunity }, { status: 200 });

    } catch (error: any) {
        console.error("UPDATE_COMMUNITY_ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
