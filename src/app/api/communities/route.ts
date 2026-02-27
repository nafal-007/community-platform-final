import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, description, category } = await req.json();

        if (!name || !description || !category) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        // Name formatting: lowercase, no spaces
        const formattedName = name.toLowerCase().replace(/\s+/g, '');

        const existingCommunity = await prisma.community.findUnique({
            where: { name: formattedName }
        });

        if (existingCommunity) {
            return NextResponse.json(
                { message: "A community with this name already exists" },
                { status: 409 }
            );
        }

        // Create Community and make creating User a highly-privileged member
        const community = await prisma.community.create({
            data: {
                name: formattedName,
                description,
                category,
                members: {
                    create: {
                        userId: session.user.id
                    }
                }
            }
        });

        return NextResponse.json(community, { status: 201 });

    } catch (error) {
        console.error("Community Creation Error: ", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
