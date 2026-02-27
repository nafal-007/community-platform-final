"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function Topbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-200">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">

                {/* Mobile Logo */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg flex items-center justify-center text-white font-bold">
                        C
                    </div>
                    <span className="font-bold text-lg">CommuniNet</span>
                </div>

                {/* Global Search Bar */}
                <div className="hidden md:flex flex-1 max-w-xl px-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search communities, jobs, schemes..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                    </div>
                </div>

                {/* Auth / Profile Actions */}
                <div className="flex items-center gap-4 ml-auto">
                    {status === "loading" ? (
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                    ) : session ? (
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-500 hover:text-brand-600 transition-colors rounded-full hover:bg-brand-50">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-semibold text-slate-700">{session.user?.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{session.user?.role?.toLowerCase() || 'Member'}</p>
                                </div>
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-700 font-bold shadow-sm">
                                        {session.user?.name?.[0] || 'U'}
                                    </div>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all md:ml-2"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
                                Log in
                            </Link>
                            <Link href="/register" className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full shadow-sm transition-all hover:shadow-md">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
