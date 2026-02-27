import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // If the user is logged in but tries to access login/register, redirect to dashboard
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
        if (isAuthPage && req.nextauth.token) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
                const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
                const isApiRegisterRoute = req.nextUrl.pathname.startsWith("/api/register");

                // Allow public access to auth pages and auth api routes
                if (isAuthPage || isApiAuthRoute || isApiRegisterRoute) {
                    return true;
                }

                // Require token for all other routes (Dashboard, Communities, etc.)
                return !!token;
            },
        },
        pages: {
            signIn: "/login",
        }
    }
);

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
