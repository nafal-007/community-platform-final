import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, PlusCircle, ArrowRight } from "lucide-react";

export default async function CommunitiesPage() {
    const communities = await prisma.community.findMany({
        include: {
            _count: {
                select: { members: true, posts: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 bg-gradient-to-r from-brand-600 to-brand-500 text-white border-0">
                <div>
                    <h1 className="text-2xl font-bold">Explore Communities</h1>
                    <p className="text-brand-100 mt-1 max-w-xl">
                        Join structured spaces for high-validity discussions. 1-on-1 interaction is disabled to prioritize healthy, public community sharing.
                    </p>
                </div>
                <Link
                    href="/communities/new"
                    className="px-5 py-2.5 bg-white text-brand-600 hover:bg-brand-50 rounded-lg font-bold transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
                >
                    <PlusCircle className="w-5 h-5" />
                    Create Community
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.length === 0 ? (
                    <div className="col-span-full glass-panel p-12 text-center text-slate-500">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-lg font-medium text-slate-700">No communities yet.</p>
                        <p className="text-sm">Be the first to create one!</p>
                    </div>
                ) : (
                    communities.map((community) => (
                        <Link
                            key={community.id}
                            href={`/c/${community.name.toLowerCase()}`}
                            className="glass-panel p-5 hover:border-brand-300 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 group-hover:w-2 transition-all"></div>

                            <div className="flex justify-between items-start mb-3 pl-2">
                                <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-100 uppercase tracking-wide">
                                    {community.category}
                                </span>
                                <span className="flex items-center text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                    <Users className="w-3 h-3 mr-1" />
                                    {community._count.members}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-surface-900 pl-2 group-hover:text-brand-600 transition-colors">
                                c/{community.name}
                            </h3>

                            <p className="text-sm text-surface-500 mt-2 pl-2 line-clamp-2 flex-grow">
                                {community.description}
                            </p>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-brand-600 font-medium text-sm pl-2">
                                <span>{community._count.posts} Active Posts</span>
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
