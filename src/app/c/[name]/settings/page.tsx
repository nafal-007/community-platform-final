"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CommunitySettingsPage({ params }: { params: Promise<{ name: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const decodedName = decodeURIComponent(resolvedParams.name);

    const [communityId, setCommunityId] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                // Determine ID and current details by fetching via a quick search or public get
                // We'll use a direct fetch to the global communities route, filtering by name.
                const res = await fetch(`/api/communities?search=${encodeURIComponent(decodedName)}`);
                if (res.ok) {
                    const data = await res.json();
                    const target = data.find((c: any) => c.name === decodedName);
                    if (target) {
                        setCommunityId(target.id);
                        setImagePreview(target.avatarUrl);
                    } else {
                        setError("Community not found");
                    }
                }
            } catch (err) {
                setError("Failed to load community details");
            } finally {
                setLoading(false);
            }
        };

        fetchCommunity();
    }, [decodedName]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("Image must be less than 5MB");
                return;
            }
            setFile(selectedFile);
            setError("");
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSave = async () => {
        if (!communityId) return;
        setSaving(true);
        setError("");

        try {
            let uploadedImageUrl = imagePreview;

            // 1. Upload to Cloudinary if a new file is selected
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Failed to upload image.");
                const uploadData = await uploadRes.json();
                uploadedImageUrl = uploadData.url;
            }

            // 2. Update Community Settings
            const updateRes = await fetch(`/api/communities/${communityId}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    avatarUrl: uploadedImageUrl
                }),
            });

            if (!updateRes.ok) {
                const errData = await updateRes.json();
                throw new Error(errData.message || "Failed to update settings.");
            }

            router.push(`/c/${encodeURIComponent(decodedName)}`);
            router.refresh();

        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto w-full pt-6 pb-20">
            <Link href={`/c/${encodeURIComponent(decodedName)}`} className="text-brand-500 hover:underline flex items-center gap-2 mb-6 font-bold">
                <ArrowLeft className="w-4 h-4" /> Back to c/{decodedName}
            </Link>

            <div className="glass-panel p-8">
                <h1 className="text-2xl font-bold text-white mb-6">Community Settings</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm flex items-center gap-2 mb-6 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="space-y-8">
                    {/* Avatar Upload */}
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-4">Community Avatar Profile Picture</label>
                        <div className="flex items-center gap-6">
                            <div
                                className="relative w-32 h-32 group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-full h-full rounded-2xl border-4 text-4xl border-surface-100 bg-surface-800 overflow-hidden flex items-center justify-center relative font-bold text-brand-500">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        decodedName[0].toUpperCase()
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                        <Upload className="w-8 h-8 text-white mb-1" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/jpeg, image/png, image/webp"
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1">Upload a custom logo</h3>
                                <p className="text-slate-400 text-sm max-w-sm">
                                    A memorable logo makes your community stand out on the global feed. Recommended format: PNG or JPG, max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-surface-100 flex justify-end gap-4">
                        <Link href={`/c/${encodeURIComponent(decodedName)}`} className="px-6 py-2.5 bg-surface-100 hover:bg-surface-200 text-white font-bold rounded-xl transition-colors">
                            Cancel
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-black font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
