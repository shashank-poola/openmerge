export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-gradient-to-b from-[#131313] to-[#0f0f0f]">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-xs font-bold tracking-widest uppercase text-[#333]">PullRabbit</p>
                <div className="flex gap-8">
                    {['Privacy', 'Terms', 'Docs', 'Blog'].map((link) => (
                        <a
                            key={link}
                            href="#"
                            className="text-xs text-[#333] hover:text-[#666] tracking-wide transition-colors"
                        >
                            {link}
                        </a>
                    ))}
                </div>
                <p className="text-xs text-[#2a2a2a] tracking-wide">© 2025 PullRabbit</p>
            </div>
        </footer>
    );
}
