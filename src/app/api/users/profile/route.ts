import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { bio, image, name, username } = await req.json();

        const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!currentUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const updateData: any = {};
        if (bio !== undefined) updateData.bio = bio;
        if (image !== undefined) updateData.image = image;
        if (name !== undefined) updateData.name = name;

        if (username !== undefined && username !== currentUser.username) {
            // Check 20-day cooldown
            if (currentUser.lastUsernameChange) {
                const daysSinceChange = (Date.now() - currentUser.lastUsernameChange.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceChange < 20) {
                    return NextResponse.json({
                        message: `You can only change your username once every 20 days. Please wait ${Math.ceil(20 - daysSinceChange)} more days.`
                    }, { status: 400 });
                }
            }

            // Ensure unique username
            const existingUser = await prisma.user.findUnique({ where: { username } });
            if (existingUser) {
                return NextResponse.json({ message: "Username is already taken." }, { status: 400 });
            }

            updateData.username = username;
            updateData.lastUsernameChange = new Date();
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                image: true
            }
        });

        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");

        if (!search) {
            return NextResponse.json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: search } },
                    { name: { contains: search } }
                ]
            },
            select: {
                id: true,
                username: true,
                name: true,
                image: true,
                bio: true
            },
            take: 20
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
