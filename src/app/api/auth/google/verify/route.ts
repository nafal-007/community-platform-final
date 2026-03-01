import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { credential } = await req.json();

        if (!credential) {
            return NextResponse.json({ message: "No credential provided" }, { status: 400 });
        }

        // Verify the token with Google's public endpoint
        // This is a secure way to decode and verify the JWT without needing the google-auth-library backend package
        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;

        const response = await fetch(verifyUrl);
        const payload = await response.json();

        if (!response.ok || payload.error) {
            return NextResponse.json({ message: "Invalid Google Token" }, { status: 401 });
        }

        // The token is valid and signed by Google. We can extract the verified email and profile info.
        return NextResponse.json({
            email: payload.email,
            email_verified: payload.email_verified,
            name: payload.name,
            picture: payload.picture
        }, { status: 200 });

    } catch (error) {
        console.error("GOOGLE_VERIFY_ERROR", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
