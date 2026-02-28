"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Registration failed");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative overflow-hidden">
            <div className="w-full max-w-md">
                {/* App Branding */}
                <div className="flex flex-col items-center mb-10">
                    <Logo className="mb-4" iconSize="w-16 h-16" textSize="text-5xl" dark={true} />
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create an Account</h1>
                    <p className="text-slate-400 mt-2">Join US today</p>
                </div>

                {/* Register Form Card */}
                <div className="glass-panel p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success ? (
                        <div className="p-8 text-center bg-brand-50 border border-brand-100 rounded-xl space-y-4">
                            <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto" />
                            <h3 className="text-lg font-bold text-brand-900">Registration Successful!</h3>
                            <p className="text-sm text-brand-700">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white block">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm mb-1 placeholder:text-slate-600"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white block">Username</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">@</div>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        pattern="[a-zA-Z0-9_]+"
                                        title="Only letters, numbers, and underscores are allowed."
                                        className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm mb-1 placeholder:text-slate-600"
                                        placeholder="johndoe"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">This will be your unique handle.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm mb-1 placeholder:text-slate-600"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white block">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        minLength={6}
                                        className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm placeholder:text-slate-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-black py-3 rounded-xl font-bold transition-all shadow-sm mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "Create Account"}
                                {!loading && <ArrowRight className="w-4 h-4 text-black" />}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-6 flex justify-center text-sm">
                            <span className="text-slate-400">Already have an account? </span>
                            <Link href="/login" className="ml-1 font-bold text-brand-500 hover:text-brand-600">
                                Log in
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
