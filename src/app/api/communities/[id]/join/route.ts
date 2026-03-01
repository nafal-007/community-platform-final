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
        const communityId = resolvedParams.id;

        const community = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                members: {
                    where: { userId: session.user.id }
                }
            }
        });

        if (!community) {
            return NextResponse.json({ message: "Community not found" }, { status: 404 });
        }

        // 1. Check if already a member
        if (community.members.length > 0) {
            return NextResponse.json({ message: "Already a member" }, { status: 400 });
        }

        // 2. If Public, join immediately
        if (!community.isPrivate) {
            await prisma.communityMember.create({
                data: {
                    userId: session.user.id,
                    communityId: community.id
                }
            });
            return NextResponse.json({ message: "Joined successfully", status: "ACCEPTED" }, { status: 200 });
        }

        // 3. If Private, check for existing request
        const existingRequest = await prisma.joinRequest.findUnique({
            where: {
                userId_communityId: {
                    userId: session.user.id,
                    communityId: community.id
                }
            }
        });

        if (existingRequest) {
            if (existingRequest.status === "PENDING") {
                return NextResponse.json({ message: "Request already pending", status: "PENDING" }, { status: 200 });
            }
            if (existingRequest.status === "REJECTED") {
                return NextResponse.json({ message: "Your previous request was rejected.", status: "REJECTED" }, { status: 403 });
            }
        }

        // 4. Create new Join Request
        const newRequest = await prisma.joinRequest.create({
            data: {
                userId: session.user.id,
                communityId: community.id,
                status: "PENDING"
            }
        });

        // 5. Notify Community Admins
        const communityAdmins = await prisma.communityMember.findMany({
            where: {
                communityId: community.id,
                role: "ADMIN"
            }
        });

        if (communityAdmins.length > 0) {
            await prisma.notification.createMany({
                data: communityAdmins.map(admin => ({
                    userId: admin.userId,
                    type: "JOIN_REQUEST",
                    message: `${session.user.name || session.user.email} requested to join c/${community.name}.`,
                    link: "/admin/requests"
                }))
            });
        }

        return NextResponse.json({ message: "Join request sent", status: "PENDING" }, { status: 200 });

    } catch (error: any) {
        console.error("JOIN_COMMUNITY_ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
