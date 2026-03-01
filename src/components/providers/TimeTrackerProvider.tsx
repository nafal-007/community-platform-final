"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

interface TimeTrackerContextType {
    totalSecondsToday: number;
}

const TimeTrackerContext = createContext<TimeTrackerContextType>({ totalSecondsToday: 0 });

export const useTimeTracker = () => useContext(TimeTrackerContext);

export function TimeTrackerProvider({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const [totalSecondsToday, setTotalSecondsToday] = useState(0);
    const [hasWarned, setHasWarned] = useState(false);

    // Use refs to hold the current values for the interval closure and to batch un-synced seconds
    const unSyncedSeconds = useRef(0);
    const totalSecondsRef = useRef(0);
    const isActiveRef = useRef(true); // Track if the tab is visible/active

    // 1. Initial Fetch on Mount
    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/user/time-tracking")
                .then((res) => res.json())
                .then((data) => {
                    if (data.totalSecondsToday !== undefined) {
                        setTotalSecondsToday(data.totalSecondsToday);
                        totalSecondsRef.current = data.totalSecondsToday;
                    }
                })
                .catch(console.error);
        }
    }, [status]);

    // 2. Track Active Time Locally (Every 1 Second)
    useEffect(() => {
        if (status !== "authenticated") return;

        const handleVisibilityChange = () => {
            isActiveRef.current = document.visibilityState === "visible";
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        const tickInterval = setInterval(() => {
            if (isActiveRef.current) {
                unSyncedSeconds.current += 1;
                totalSecondsRef.current += 1;
                setTotalSecondsToday(totalSecondsRef.current);

                // Warning Check: 2 Hours (7200 seconds)
                if (totalSecondsRef.current >= 7200 && !hasWarned) {
                    setHasWarned(true);
                    // Dispatch a custom event that a Toast system can listen to, or handle natively
                    window.dispatchEvent(new CustomEvent("TIME_LIMIT_WARNING"));
                }
            }
        }, 1000);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clearInterval(tickInterval);
        };
    }, [status, hasWarned]);

    // 3. Flush Un-synced Time to the Backend (Every 60 Seconds or Unload)
    useEffect(() => {
        if (status !== "authenticated") return;

        const syncToBackend = async () => {
            const secondsToSync = unSyncedSeconds.current;
            if (secondsToSync > 0) {
                // Instantly reset so we don't double count
                unSyncedSeconds.current = 0;

                try {
                    await fetch("/api/user/time-tracking", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ seconds: secondsToSync }),
                        keepalive: true, // Needed for page unload requests
                    });
                } catch (error) {
                    console.error("Failed to sync time tracking:", error);
                    // Re-add them if failed, to try again next time
                    unSyncedSeconds.current += secondsToSync;
                }
            }
        };

        const flushInterval = setInterval(syncToBackend, 60000);

        // Also flush when user closes the tab / navigates away
        window.addEventListener("beforeunload", syncToBackend);

        return () => {
            clearInterval(flushInterval);
            window.removeEventListener("beforeunload", syncToBackend);
            syncToBackend(); // Final flush on unmount
        };
    }, [status]);

    return (
        <TimeTrackerContext.Provider value={{ totalSecondsToday }}>
            {children}

            {/* Simple Floating Warning Toast that appears when event triggers */}
            {hasWarned && (
                <div className="fixed bottom-6 right-6 max-w-sm bg-brand-500 text-black p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 border border-brand-400">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h4 className="font-bold text-lg mb-1">Digital Wellbeing Alert</h4>
                            <p className="text-sm font-medium opacity-90">
                                You&apos;ve been on the platform for over 2 hours today. Consider taking a short break!
                            </p>
                        </div>
                        <button
                            onClick={() => setHasWarned(false)}
                            className="bg-black/10 hover:bg-black/20 p-1 rounded-md transition-colors font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </TimeTrackerContext.Provider>
    );
}
