import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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

        // Check if user is a member
        const membership = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: session.user.id,
                    communityId: communityId
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ message: "You are not a member of this community" }, { status: 400 });
        }

        if (membership.role === "ADMIN") {
            // Optional: Handle admin leaving rules if necessary, but we'll let them leave for now.
        }

        // Delete the membership
        await prisma.communityMember.delete({
            where: {
                userId_communityId: {
                    userId: session.user.id,
                    communityId: communityId
                }
            }
        });

        // Delete any pending join requests just in case
        await prisma.joinRequest.deleteMany({
            where: {
                userId: session.user.id,
                communityId: communityId
            }
        });

        return NextResponse.json({ message: "Left community successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("LEAVE_COMMUNITY_ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
