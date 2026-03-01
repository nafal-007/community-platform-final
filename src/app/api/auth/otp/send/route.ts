import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 0. Check if the email is already registered to an active account
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 400 });
        }

        // 1. Generate a secure 6-digit numeric OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // 2. Set expiration time to 10 minutes from now
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        // 3. Upsert into Prisma VerificationToken table (removes any old token for this email)
        await prisma.verificationToken.deleteMany({
            where: { identifier: email }
        });

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: otp,
                expires: expires,
            },
        });

        // 4. Send the Email via Nodemailer
        // For development, we use ethereal to instantly get a preview URL without needing real SMTP
        // In production, fallback to process.env variables.
        let transporter;

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else if (process.env.NODE_ENV === "development") {
            console.log("No SMTP environment variables detected. Generating an Ethereal Mock Account for local development...");
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        } else {
            throw new Error("SMTP variables (SMTP_HOST, SMTP_USER, SMTP_PASS) are missing in Vercel settings.");
        }

        const info = await transporter.sendMail({
            from: '"CommuniNet Verification" <noreply@communinet.app>',
            to: email,
            subject: "Your Registration Code - CommuniNet",
            text: `Your verification code is: ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Welcome to CommuniNet</h2>
                    <p style="color: #555; text-align: center;">Use the following code to verify your identity and complete your registration.</p>
                    
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${otp}</span>
                    </div>
                    
                    <p style="color: #888; font-size: 12px; text-align: center;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
                </div>
            `,
        });

        // Provide the preview URL in the server logs so the developer can see the mocked email
        if (!process.env.SMTP_HOST) {
            console.log("Mock Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Error sending OTP:", error);

        let errorMessage = "Failed to send verification code.";

        // Differentiate errors for easier debugging
        if (error.code?.startsWith('P')) {
            errorMessage = `Database Error (${error.code}): Ensure your DATABASE_URL is correct and tables are created.`;
        } else if (error.message?.includes("SMTP") || error.command === 'CONN') {
            errorMessage = "Email Server Error: Check your SMTP settings (Host, User, Pass).";
        }

        return NextResponse.json({
            error: errorMessage,
            devDetails: error.message
        }, { status: 500 });
    }
}
