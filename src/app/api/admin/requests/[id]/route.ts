import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const requestId = resolvedParams.id;
        const { action } = await req.json(); // "APPROVE" or "REJECT"

        if (action !== "APPROVE" && action !== "REJECT") {
            return NextResponse.json({ message: "Invalid action" }, { status: 400 });
        }

        const joinRequest = await prisma.joinRequest.findUnique({
            where: { id: requestId },
            include: { community: true, user: true }
        });

        if (!joinRequest) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }

        // Verify that the current user is an ADMIN of this community
        const isCommunityAdmin = await prisma.communityMember.findFirst({
            where: {
                communityId: joinRequest.communityId,
                userId: session.user.id,
                role: "ADMIN"
            }
        });

        if (!isCommunityAdmin) {
            return NextResponse.json({ message: "Forbidden: You are not an admin of this community" }, { status: 403 });
        }

        if (joinRequest.status !== "PENDING") {
            return NextResponse.json({ message: "Request already processed" }, { status: 400 });
        }

        if (action === "APPROVE") {
            // 1. Add user to CommunityMembers
            await prisma.communityMember.create({
                data: {
                    userId: joinRequest.userId,
                    communityId: joinRequest.communityId
                }
            });

            // 2. Mark JoinRequest as Accepted
            await prisma.joinRequest.update({
                where: { id: requestId },
                data: { status: "ACCEPTED" }
            });

            // 3. Notify User
            await prisma.notification.create({
                data: {
                    userId: joinRequest.userId,
                    type: "REQUEST_ACCEPTED",
                    message: `Your request to join c/${joinRequest.community.name} was approved!`,
                    link: `/c/${joinRequest.community.name}`
                }
            });

        } else if (action === "REJECT") {
            // 1. Mark JoinRequest as Rejected
            await prisma.joinRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" }
            });

            // 2. Notify User
            await prisma.notification.create({
                data: {
                    userId: joinRequest.userId,
                    type: "REQUEST_REJECTED",
                    message: `Your request to join c/${joinRequest.community.name} was declined.`,
                    link: null
                }
            });
        }

        return NextResponse.json({ message: `Request successfully ${action}D` }, { status: 200 });

    } catch (error: any) {
        console.error("PROCESS_JOIN_REQUEST_ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
