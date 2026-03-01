import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary using a promise-wrapped stream
        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "community_platform",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        }) as any;

        return NextResponse.json({ url: uploadResponse.secure_url }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
