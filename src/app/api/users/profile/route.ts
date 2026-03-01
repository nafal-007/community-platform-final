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

        const { bio, image } = await req.json();

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                bio: bio !== undefined ? bio : undefined,
                image: image !== undefined ? image : undefined,
            },
            select: {
                id: true,
                username: true,
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
