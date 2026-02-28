import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { name, username, email, password } = await req.json();

        if (!name || !username || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Clean username (lowercase, remove spaces)
        let cleanUsername = username.toLowerCase().replace(/\s+/g, '');
        // Prefix with @ if not provided
        if (!cleanUsername.startsWith('@')) {
            cleanUsername = `@${cleanUsername}`;
        }

        // Check if user already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingEmail) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        const existingUsername = await prisma.user.findUnique({
            where: { username: cleanUsername }
        });

        if (existingUsername) {
            return NextResponse.json(
                { message: "Username is already taken" },
                { status: 409 }
            );
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                username: cleanUsername,
                email,
                hashedPassword,
                // The role "USER" is set by default in the Prisma schema
            }
        });

        return NextResponse.json(
            { message: "User created successfully", userId: user.id },
            { status: 201 }
        );

    } catch (error) {
        console.error("Registration Error: ", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
