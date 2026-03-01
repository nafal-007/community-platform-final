import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
        }

        // 1. Find the token in the database for this email
        const tokenRecord = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
            }
        });

        // 2. Exact Match Check
        if (!tokenRecord) {
            return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
        }

        // 3. Expiration Check
        if (new Date() > tokenRecord.expires) {
            // Clean up expired token
            await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token: code } } });
            return NextResponse.json({ error: "This verification code has expired. Please request a new one." }, { status: 400 });
        }

        // 4. Success! OTP is valid. Consume it so it cannot be reused.
        await prisma.verificationToken.delete({
            where: {
                identifier_token: { identifier: email, token: code }
            }
        });

        return NextResponse.json({ success: true, message: "Email successfully verified!" }, { status: 200 });

    } catch (error: any) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json({ error: "Failed to verify the OTP Code." }, { status: 500 });
    }
}
