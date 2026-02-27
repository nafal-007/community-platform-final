"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Users,
    Briefcase,
    Newspaper,
    GraduationCap,
    HeartPulse,
    Settings,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "All Communities", href: "/communities", icon: Users },
    { name: "Jobs & Careers", href: "/c/jobs", icon: Briefcase },
    { name: "Daily News", href: "/c/news", icon: Newspaper },
    { name: "Education Hub", href: "/c/education", icon: GraduationCap },
    { name: "Emergencies", href: "/c/emergencies", icon: HeartPulse },
    { name: "Govt Schemes", href: "/c/schemes", icon: ShieldAlert },
];

export function Sidebar() {
    const pathname = usePathname();

    // Hide sidebar on auth pages
    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <div className="hidden md:flex flex-col w-64 border-r border-surface-100 bg-white/50 backdrop-blur-xl h-full transition-all">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
                    CommuniNet
                </h1>
                <p className="text-xs text-slate-500 mt-1">Structured Networking</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-brand-50 text-brand-600"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5",
                                isActive ? "text-brand-500" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-surface-100 pb-8">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                    <Settings className="w-5 h-5 text-slate-400" />
                    Settings
                </Link>
            </div>
        </div>
    );
}
