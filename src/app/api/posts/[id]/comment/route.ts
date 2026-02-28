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

        const { content } = await req.json();

        if (!content || typeof content !== 'string' || !content.trim()) {
            return NextResponse.json(
                { message: "Comment content is required." },
                { status: 400 }
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

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                postId,
                authorId: userId
            },
            include: {
                author: {
                    select: { name: true, image: true }
                }
            }
        });

        return NextResponse.json(
            { message: "Comment created", comment },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("COMMENT_ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
