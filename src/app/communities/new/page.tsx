"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Info, ArrowRight, Loader2 } from "lucide-react";

const CATEGORIES = [
    "Jobs & Careers",
    "Daily News",
    "Education Hub",
    "Medical & Emergencies",
    "Government Schemes",
    "Sports",
    "Donations & Charity",
    "Skill Development",
    "General Social",
];

export default function CreateCommunityPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            category: formData.get("category") as string,
        };

        try {
            const res = await fetch("/api/communities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to create community");
            }

            const newCommunity = await res.json();
            router.push(`/communities`);
            router.refresh();

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-900">Create a Community</h1>
                <p className="text-surface-500 mt-2">
                    Start a new focused space for structural discussions. Remember, platforms are heavily moderated for misinformation.
                </p>
            </div>

            <div className="glass-panel p-8">
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Users className="w-4 h-4 text-brand-500" />
                            Community Name
                        </label>
                        <p className="text-xs text-slate-500 mb-2">Must be unique, without spaces. Examples: TechJobs, LocalNews</p>
                        <div className="relative flex items-center">
                            <span className="absolute left-3 text-slate-400 font-bold">c/</span>
                            <input
                                type="text"
                                name="name"
                                required
                                pattern="[a-zA-Z0-9]+"
                                title="Only letters and numbers, no spaces allowed"
                                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                placeholder="Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Info className="w-4 h-4 text-brand-500" />
                            Description
                        </label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm resize-none"
                            placeholder="What is this community about? Who should join?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Category / Topic</label>
                        <select
                            name="category"
                            required
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                        >
                            <option value="" disabled selected>Select a primary category...</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Community"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
