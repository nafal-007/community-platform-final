"use client";

import { useSession } from "next-auth/react";
import { Clock, BookOpen, AlertCircle, PlusCircle, Users } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">

      {/* Welcome & Stats Row */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* Welcome Card */}
        <div className="flex-1 glass-panel p-6 bg-gradient-to-br from-white/90 to-brand-50/80">
          <h2 className="text-2xl font-bold text-surface-900">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Member'}!
          </h2>
          <p className="text-surface-500 mt-1">Here's what's happening in your communities today.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/communities/new" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              Create Post
            </Link>
            <Link href="/communities" className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
              <Users className="w-4 h-4" />
              Browse Communities
            </Link>
          </div>
        </div>

        {/* Time Tracker Widget */}
        <div className="w-full md:w-72 glass-panel p-6 border-brand-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-brand-500 pointer-events-none">
            <Clock className="w-24 h-24 -mt-6 -mr-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-semibold text-sm mb-1">
              <Clock className="w-4 h-4" />
              Focus & Well-being
            </div>
            <h3 className="text-3xl font-bold text-surface-900 mt-1">1h 24m</h3>
            <p className="text-xs text-surface-500 mt-1">Time spent today</p>
          </div>

          <div className="mt-4">
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Daily Limit</span>
              <span className="font-medium text-slate-700">3h 00m</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-surface-900">Your Feed</h3>
            <div className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-lg p-1">
              <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">Recent</button>
              <button className="px-3 py-1 text-slate-500 hover:text-slate-700 font-medium">Top Rated</button>
            </div>
          </div>

          {/* Placeholder Empty State */}
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-brand-500" />
            </div>
            <h4 className="text-lg font-bold text-surface-900 mb-2">Your feed is quiet</h4>
            <p className="text-surface-500 text-sm max-w-sm">
              Join communities like Jobs, News, or Education to see structural, high-validity posts here.
            </p>
            <Link href="/communities" className="mt-6 px-6 py-2.5 bg-surface-900 hover:bg-surface-800 text-white rounded-lg font-medium transition-colors text-sm shadow-sm">
              Explore Communities
            </Link>
          </div>
        </div>

        {/* Sidebar / AI Notes Column */}
        <div className="space-y-6">

          {/* AI Learning Notes Widget */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-4">
              <BookOpen className="w-4 h-4" />
              Daily AI Summarizer
            </div>
            <textarea
              placeholder="Paste your learning notes here..."
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
            ></textarea>
            <button className="w-full mt-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              Generate Smart Summary
            </button>
          </div>

          {/* Warnings & Integrity Widget */}
          <div className="glass-panel p-5 border-amber-100 bg-gradient-to-b from-amber-50/50 to-white">
            <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              Platform Integrity
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-xs font-medium text-slate-600">Pending Warnings</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold">0</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-xs font-medium text-slate-600">Your Trust Score</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">100/100</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
              Misinformation or spam reduces your trust score and limits posting abilities. Keep the community clean!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
