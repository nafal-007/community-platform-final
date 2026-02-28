import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const postId = resolvedParams.id;
        const userId = session.user.id;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json({ message: "Post not found." }, { status: 404 });
        }

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            return NextResponse.json({ message: "Unliked", liked: false }, { status: 200 });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    postId,
                    userId
                }
            });
            return NextResponse.json({ message: "Liked", liked: true }, { status: 200 });
        }

    } catch (error: any) {
        console.error("LIKE_ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
