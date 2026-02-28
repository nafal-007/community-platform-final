"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, Save, Loader2, Sparkles, Plus } from "lucide-react";
import { format } from "date-fns";

export default function DailyNotesClient({ pastNotes: initialPastNotes }: { pastNotes: any[] }) {
    const [notes, setNotes] = useState<any[]>(initialPastNotes);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    // When clicking "New Note"
    const handleNewNote = () => {
        setCurrentNoteId(null);
        setContent("");
        setTitle("");
        setSaveStatus("idle");
    };

    // When selecting a note from history
    const handleSelectNote = (note: any) => {
        setCurrentNoteId(note.id);
        setContent(note.rawContent);
        setTitle(note.title || "Untitled Note");
        setSaveStatus("idle");
    };

    const handleSave = async (isAutoSave = false) => {
        if (!content.trim() && !title.trim() && !isSaving) return;
        setIsSaving(true);
        if (!isAutoSave) setSaveStatus("saving");

        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: currentNoteId,
                    content,
                    title: title.trim() || undefined
                })
            });

            if (res.ok) {
                const data = await res.json();
                const savedNote = data.note;

                // If it was a new note, update our currentNoteId focus
                if (!currentNoteId) {
                    setCurrentNoteId(savedNote.id);
                    setTitle(savedNote.title);
                }

                // Update the local notes list state
                setNotes(prev => {
                    const exists = prev.find(n => n.id === savedNote.id);
                    if (exists) {
                        return prev.map(n => n.id === savedNote.id ? savedNote : n).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    } else {
                        return [savedNote, ...prev];
                    }
                });

                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
            }
        } catch (error) {
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save logic
    useEffect(() => {
        // Skip empty unchanged new note
        if (!currentNoteId && content === "" && title === "") return;

        // Let's implement debounce
        const timer = setTimeout(() => {
            handleSave(true);
        }, 1500); // 1.5 seconds debounce

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, title]);

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-full">
            {/* Left Column: Editor */}
            <div className="flex-1 flex flex-col min-h-[500px]">
                <div className="glass-panel flex flex-col h-full border-t-4 border-t-brand-500 rounded-none rounded-b-2xl overflow-hidden">

                    {/* Header */}
                    <div className="p-6 bg-surface-800/50 border-b border-surface-100 flex items-center justify-between">
                        <div className="flex items-center gap-4 w-full">
                            <div className="w-12 h-12 shrink-0 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Note Title (Optional)"
                                    className="bg-transparent text-xl font-bold text-white placeholder-slate-500 focus:outline-none w-full"
                                />
                                <p className="text-xs text-brand-500 font-bold uppercase tracking-wide mt-1">
                                    {currentNoteId
                                        ? format(new Date(notes.find(n => n.id === currentNoteId)?.date || new Date()), "EEEE, MMMM do, yyyy")
                                        : "New Unsaved Note"
                                    }
                                </p>
                            </div>

                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSaving || (!content.trim() && !title.trim())}
                                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/20"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {isSaving ? "Saving..." : "Save Note"}
                            </button>
                        </div>
                    </div>

                    {/* Status Banners */}
                    <div className="px-6 pt-4">
                        {saveStatus === "saved" && (
                            <div className="mb-4 p-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Note saved successfully!
                            </div>
                        )}
                        {saveStatus === "error" && (
                            <div className="mb-4 p-3 bg-red-400/10 text-red-400 border border-red-400/20 rounded-lg text-sm font-medium">
                                Failed to save note. Please try again.
                            </div>
                        )}
                    </div>

                    {/* Textarea */}
                    <div className="flex-1 p-6 pt-0">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your learning notes, concepts, or ideas here..."
                            className="w-full h-full min-h-[400px] bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none resize-none font-mono text-sm leading-relaxed custom-scrollbar"
                        />
                    </div>
                </div>
            </div>

            {/* Right Column: Historical Notes History */}
            <div className="w-full lg:w-96 flex flex-col mt-6 lg:mt-0">
                <div className="glass-panel p-6 sticky top-6 max-h-[calc(100vh-100px)] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-brand-500" />
                            Notes History
                        </h3>
                        <button
                            onClick={handleNewNote}
                            className="p-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 rounded-lg transition-colors"
                            title="Create New Note"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {notes.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="w-10 h-10 text-surface-100 mx-auto mb-3" />
                            <p className="text-sm text-slate-400">Your past notes will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-6">
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => handleSelectNote(note)}
                                    className={`p-4 border rounded-xl transition-all cursor-pointer group ${currentNoteId === note.id
                                            ? "bg-brand-500/10 border-brand-500 border-l-4"
                                            : "bg-surface-800/50 border-surface-100 hover:border-brand-500/50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`text-sm font-bold transition-colors line-clamp-1 pr-2 ${currentNoteId === note.id ? "text-brand-500" : "text-white group-hover:text-brand-500"}`}>
                                            {note.title || "Untitled Note"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2 truncate">
                                        {format(new Date(note.date), "MMM dd, yyyy • h:mm a")}
                                    </p>
                                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                        {note.rawContent || "Empty note..."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
