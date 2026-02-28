"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Home,
    Users,
    Briefcase,
    Newspaper,
    GraduationCap,
    HeartPulse,
    Settings,
    ShieldAlert,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "All Communities", href: "/communities", icon: Users },
    { name: "Jobs & Careers", href: "/c/jobs", icon: Briefcase },
    { name: "Daily News", href: "/c/news", icon: Newspaper },
    { name: "Education Hub", href: "/c/education", icon: GraduationCap },
    { name: "Daily Notes", href: "/notes", icon: BookOpen },
    { name: "Emergencies", href: "/c/emergencies", icon: HeartPulse },
    { name: "Govt Schemes", href: "/c/schemes", icon: ShieldAlert },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Hide sidebar on auth pages
    if (pathname === '/login' || pathname === '/register') return null;

    const user = session?.user as any;
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
    const profileLink = user?.username ? `/u/${user.username.replace('@', '')}` : '/';

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-surface-100 bg-surface-50 h-full overflow-y-auto">
            {/* User Profile Summary */}
            <div className="p-6 pb-4 border-b border-surface-100 flex flex-col items-center">
                <Link href={profileLink} className="flex flex-col items-center group">
                    <div className="w-16 h-16 rounded-full bg-surface-800 border-2 border-surface-100 group-hover:border-brand-500 transition-colors flex items-center justify-center text-white font-black text-2xl shadow-sm mb-3 overflow-hidden">
                        {user?.image ? (
                            <img src={user.image} alt={user?.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                            <span>{initial}</span>
                        )}
                    </div>
                    <h2 className="text-sm font-bold text-white group-hover:text-brand-500 transition-colors">
                        {user?.name || "Guest User"}
                    </h2>
                    <p className="text-xs text-brand-500 font-medium mb-4">{user?.username || "@guest"}</p>
                </Link>

                <div className="flex w-full justify-between px-2 text-center">
                    <div>
                        <p className="font-bold text-white text-sm">--</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Posts</p>
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">--</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Followers</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group",
                                isActive
                                    ? "bg-brand-500 text-black shadow-sm"
                                    : "text-slate-400 hover:bg-surface-100 hover:text-white"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5",
                                isActive ? "text-black" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-surface-100">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all"
                >
                    <ShieldAlert className="w-5 h-5" />
                    Warning Status
                </Link>
            </div>
        </aside>
    );
}
