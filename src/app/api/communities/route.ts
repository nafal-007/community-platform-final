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

        const { name, description, category, isPrivate } = await req.json();

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

        // Create Community and make creating User a highly-privileged member using a transaction
        const community = await prisma.$transaction(async (tx) => {
            const newCommunity = await tx.community.create({
                data: {
                    name: formattedName,
                    description,
                    category,
                    isPrivate: !!isPrivate,
                } as any
            });

            await tx.communityMember.create({
                data: {
                    userId: session.user.id,
                    communityId: newCommunity.id,
                    role: "ADMIN"
                } as any
            });

            return newCommunity;
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
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        const communities = await prisma.community.findMany({
            where: query ? {
                OR: [
                    { name: { contains: query } },
                    { description: { contains: query } },
                    { category: { contains: query } }
                ]
            } : {},
            orderBy: {
                name: "asc"
            }
        });

        return NextResponse.json(communities);

    } catch (error) {
        console.error("Community Fetch Error: ", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
