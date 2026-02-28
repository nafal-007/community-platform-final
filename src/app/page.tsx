"use client";

import { useSession } from "next-auth/react";
import { Clock, BookOpen, AlertCircle, PlusCircle, Users } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-3xl mx-auto w-full pt-6 pb-20">

      {/* Stories / Highlight Bar */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
            <div className={`w-16 h-16 rounded-full p-[2px] ${i === 1 || i === 2 ? 'bg-brand-500' : 'bg-surface-100'}`}>
              <div className="w-full h-full rounded-full bg-surface-800 border-4 border-surface-50 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 truncate w-full text-center">User {i}</span>
          </div>
        ))}
      </div>

      {/* Post Creator Widget */}
      <div className="glass-panel p-4 mb-8">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-brand-500 flex-none flex items-center justify-center text-black font-bold">
            {session?.user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              placeholder="What's going on around you?"
              className="w-full bg-transparent border-none text-white placeholder:text-slate-500 resize-none focus:ring-0 text-sm mt-2 h-10"
            />
            <div className="flex items-center justify-between border-t border-surface-100 pt-3 mt-2">
              <div className="flex gap-2 text-brand-500">
                <button className="p-2 hover:bg-surface-100 rounded-full transition-colors"><BookOpen className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-surface-100 rounded-full transition-colors"><AlertCircle className="w-4 h-4" /></button>
              </div>
              <button className="px-6 py-1.5 bg-brand-500 hover:bg-brand-600 text-black font-bold rounded-full text-sm transition-all">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feed Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-white">Your Feed</h3>
          <div className="flex items-center gap-2 text-sm bg-surface-800 border border-surface-100 rounded-lg p-1">
            <button className="px-3 py-1 bg-surface-100 text-white rounded-md font-medium">Recent</button>
            <button className="px-3 py-1 text-slate-500 hover:text-white font-medium transition-colors">Top Rated</button>
          </div>
        </div>

        {/* Empty Feed State */}
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4 border border-surface-100">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Build your network</h4>
          <p className="text-slate-400 text-sm max-w-sm">
            Your feed is currently empty. Join communities or follow users to populate your feed with validated information.
          </p>
          <Link href="/communities" className="mt-6 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-black rounded-lg font-bold transition-colors text-sm shadow-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> Explore Communities
          </Link>
        </div>
      </div>

    </div>
  );
}
