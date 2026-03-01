import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Fetch all posts with author and community info
        // In a real app, we might filter by joined communities, but for this project a "Global Feed" is better for discoverability
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                community: {
                    select: {
                        name: true,
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50 // Limit to latest 50 posts
        });

        return NextResponse.json(posts);

    } catch (error: any) {
        console.error("GET_GLOBAL_POSTS_ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
