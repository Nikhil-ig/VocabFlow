'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Brain, Zap, Globe, Lock, Shield } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
    const router = useRouter();
    const { user, status } = useAuth();
  const session = user ? { user } : null;

    // If already logged in, they can still view landing, or we can redirect them.
    // We'll let them view the landing page but change the CTA to "Go to Dashboard"

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-primary-500/30 overflow-x-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        VocabFlow
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {status === 'authenticated' ? (
                        <button
                            onClick={() => router.push('/app')}
                            className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 font-medium transition-all"
                        >
                            Dashboard
                        </button>
                    ) : (
                        <>

                            <button
                                onClick={() => router.push('/login')}
                                className="hidden md:block font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => router.push('/signup')}
                                className="px-6 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg shadow-primary-600/30 transition-all hover:scale-105 active:scale-95"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-sm font-medium text-slate-300">VocabFlow 2.0 is live</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
                    Master Vocabulary <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400">
                        At Lightning Speed.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                    The AI-powered spaced repetition platform built for students, professionals, and institutions.
                    Learn faster, remember forever, and brand it as your own.
                </p>

                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                    <button
                        onClick={() => router.push(status === 'authenticated' ? '/app' : '/signup')}
                        className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold text-lg hover:bg-slate-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:-translate-y-1"
                    >
                        {status === 'authenticated' ? 'Continue Learning' : 'Start Learning Free'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => router.push('/app')}
                        className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md font-bold text-lg text-white transition-all hover:-translate-y-1"
                    >
                        Explore as Guest
                    </button>
                </div>
            </main>

            {/* Features Grid */}
            <section className="relative z-10 px-4 py-24 bg-slate-950/50 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why VocabFlow?</h2>
                        <p className="text-slate-400">Built for individual learners and entire organizations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Smart Spaced Repetition</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Our AI algorithm predicts the exact moment you are about to forget a word and tests you on it.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Organization Isolation</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Vendor Admins can create private dictionaries exclusively for their students. Total data privacy.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Globe className="w-7 h-7 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">White-Label Ready</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Organizations can upload their own logo, colors, and branding to make VocabFlow their own app.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8 text-center text-slate-500">
                <p>© 2026 VocabFlow Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
