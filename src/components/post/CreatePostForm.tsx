"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, AlertTriangle } from "lucide-react";

export default function CreatePostForm({ communityId }: { communityId: string }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/communities/${communityId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to create post.");
            }

            setTitle("");
            setContent("");
            router.refresh(); // Reload the feeds
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-5 bg-surface-900 border border-surface-100 mb-6">
            <h3 className="font-bold text-lg text-white mb-4">Share with the Community</h3>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Brief title for your post..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-50 border border-surface-100 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium placeholder:text-slate-500"
                />

                <textarea
                    required
                    maxLength={2000}
                    placeholder="What do you want to share with this community? Be accurate and supportive."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full bg-surface-50 border border-surface-100 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm resize-none placeholder:text-slate-500"
                />

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading || !title.trim() || !content.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-black font-bold outline-none rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Send className="w-4 h-4 text-black" />}
                        {loading ? "Posting..." : "Post to Community"}
                    </button>
                </div>
            </div>
        </form>
    );
}
