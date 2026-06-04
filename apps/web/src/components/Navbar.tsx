'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

const navLinks = [
    { label: 'Home', href: '/', active: true },
    { label: 'Features', href: '#features', active: false },
    { label: 'Blogs', href: '#blogs', active: false },
    { label: 'About', href: '#about', active: false },
];

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 bg-white">
            <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">

                {/* Logo */}
                <a
                    href="/"
                    className="text-lg text-gray-950 tracking-tight"
                    style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}
                >
                    pullrabbit
                </a>

                {/* Center pill nav */}
                <div
                    className="hidden md:flex items-center bg-gray-100 rounded-full p-1"
                    style={{ fontFamily: 'var(--font-sans)' }}
                >
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className={`px-4 py-1 rounded-full text-sm transition-all ${
                                link.active
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-950'
                            }`}
                            style={{ fontWeight: 400 }}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Right */}
                {session ? (
                    <div className="flex items-center gap-4">
                        <span
                            className="text-sm text-gray-500 hidden sm:block"
                            style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}
                        >
                            {session.user?.name}
                        </span>
                        <button
                            onClick={() => signOut()}
                            className="text-sm text-gray-600 hover:text-gray-950 transition-colors"
                            style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => signIn('github')}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm px-6 py-2 rounded-full transition-all"
                        style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                    >
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    );
}
