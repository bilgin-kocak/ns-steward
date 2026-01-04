"use client";

import { motion } from "framer-motion";
import { Bot, BookOpen, ArrowLeft, MessageSquare, Database, Sparkles, Network } from "lucide-react";
import Link from "next/link";

export default function Roadmap() {
    return (
        <main className="min-h-screen bg-white text-slate-900 overflow-hidden relative font-sans selection:bg-blue-100">

            {/* Soft Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
                <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-purple-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-pink-50 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center space-y-4"
                >
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-4 group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Assistant
                    </Link>
                    <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
                        The Roadmap for<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">NS Steward</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        From a voice assistant to a comprehensive Society Operating System. Here is what is coming next.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Feature 1: Discord Integration */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Bot className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-slate-900">Discord Native Bot</h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Seamless integration with the community hub. Tag <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono text-sm">@NS_Assistant</span> directly in any channel.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MessageSquare className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700"><strong>Instant Answers:</strong> Ask about orientation, guidelines, or locations without leaving chat.</span>
                            </li>
                            <li className="flex items-start">
                                <Network className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700"><strong>Member Graph:</strong> "Who is working on AI?" or "Connect me with designers."</span>
                            </li>
                            <li className="flex items-start">
                                <Sparkles className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700"><strong>Context Aware:</strong> Learns from public channel history to stay up-to-date.</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Feature 2: Knowledge Engine */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-slate-900">Deep Knowledge Engine</h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Expanding beyond logistics into education. A true tutor for the <span className="font-semibold">Learn. Earn. Burn.</span> curriculum.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <Database className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700"><strong>Course Ingestion:</strong> Full indexing of "Vibe Coding", Machine Learning, and other course materials.</span>
                            </li>
                            <li className="flex items-start">
                                <Sparkles className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700"><strong>Technical Tutor:</strong> Ask specific coding questions or request summaries of lectures.</span>
                            </li>
                            <li className="flex items-start">
                                <BookOpen className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700"><strong>Adaptive Learning:</strong> The assistant grows smarter as more content is added to the school.</span>
                            </li>
                        </ul>
                    </motion.div>

                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <p className="text-slate-400 text-sm">Vision for 2026 • Network School Hackathon</p>
                </motion.div>

            </div>
        </main >
    );
}
