'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-b from-[#202020] to-[#191919] shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060] border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                <a href="/" className="text-sm font-bold tracking-widest uppercase text-[#e8e8e8]">
                    PullRabbit
                </a>
                <div className="flex items-center gap-6">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-[#555] tracking-wide hidden sm:block">
                                {session.user?.name}
                            </span>
                            <button
                                onClick={() => signOut()}
                                className="text-xs font-bold tracking-widest uppercase text-[#555] hover:text-[#e8e8e8] transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn('github')}
                            className="flex items-center gap-2 bg-gradient-to-b from-[#202020] to-[#191919] shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,0_4px_6px_-3px_#00000070,0_0px_4px_0px_#00000050] border border-white/10 text-xs font-bold tracking-widest uppercase text-[#e8e8e8] px-4 py-2 hover:from-[#252525] hover:to-[#1e1e1e] transition-all active:scale-[0.97]"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            Sign In with GitHub
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
