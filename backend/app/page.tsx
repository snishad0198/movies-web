import { ShieldCheck, Database, Server, Activity, Instagram, Mail, Bug, Sparkles, ExternalLink, Cpu } from "lucide-react";

export default function BackendGatewayPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col justify-between selection:bg-rose-500/30 font-sans antialiased">
      {/* Apple-style Translucent Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#000000]/70 backdrop-blur-2xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e] flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/10">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                Movies.snishad
              </span>
              <span className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                Core Engine
              </span>
            </div>
            <p className="text-[11px] text-[#86868b]">Core Streaming Data Service</p>
          </div>
        </div>

        {/* Apple-style Breathing Status Indicator */}
        <div className="flex items-center gap-2 text-[12px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Systems Operational</span>
        </div>
      </header>

      {/* Main Apple Canvas */}
      <main className="max-w-4xl mx-auto px-6 py-14 flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-white/80 text-[11px] font-medium mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            Designed &amp; Developed by SNishad
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Streaming Infrastructure.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400">
              Refined &amp; High-Speed.
            </span>
          </h1>
          <p className="text-[#86868b] text-sm max-w-xl mx-auto leading-relaxed">
            High-performance data engine providing automated TMDB catalog synchronization, real-time multi-server health verification, and direct cloud download proxying.
          </p>
        </div>

        {/* Feature Grid - Apple HIG Liquid Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-6 rounded-3xl bg-[#1c1c1e]/60 border border-white/[0.08] backdrop-blur-xl hover:border-white/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-rose-400 flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Zero-Exposure Shield</h3>
            <p className="text-xs text-[#86868b] leading-relaxed">
              Internal database credentials, tokens, and server secrets are fully protected and never surfaced to client bundles.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#1c1c1e]/60 border border-white/[0.08] backdrop-blur-xl hover:border-white/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-amber-400 flex items-center justify-center mb-4 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Prisma ORM &amp; MySQL</h3>
            <p className="text-xs text-[#86868b] leading-relaxed">
              Relational schemas handling custom movies, series episodes, dynamic site settings, and real-time viewing metrics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#1c1c1e]/60 border border-white/[0.08] backdrop-blur-xl hover:border-white/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-blue-400 flex items-center justify-center mb-4 shadow-sm">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Live Server Health</h3>
            <p className="text-xs text-[#86868b] leading-relaxed">
              Fast upstream checks verify streaming embeds before rendering to ensure only active, working servers are served.
            </p>
          </div>
        </div>

        {/* Developer Credit & Affordable Web Development Card (Apple Glass) */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1c1c1e]/80 to-[#121214]/80 border border-white/[0.08] backdrop-blur-2xl mb-8 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-xl">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Developer &amp; Web Architect
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                  SNishad
                </h2>
                <p className="text-xs text-[#a1a1a6] leading-relaxed mt-1">
                  Want to build your own custom website, streaming platform, or web application at an affordable price? Connect with me directly!
                </p>
              </div>

              {/* Bug Report Note */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                <Bug className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#86868b] leading-relaxed">
                  <strong className="text-amber-300">Found a bug or issue?</strong> Please report it to me on Instagram (<span className="text-white font-medium">@snishad.me_</span>). I know it may have bugs, but I don&apos;t know everything — your bug reports and feedback help make this project better!
                </p>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="https://instagram.com/snishad.me_"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white text-xs font-semibold shadow-lg shadow-pink-950/40 transition-all hover:scale-105"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram: @snishad.me_</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </a>

                <a
                  href="mailto:snishad01985@gmail.com"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold border border-white/[0.08] transition-all hover:scale-105"
                >
                  <Mail className="w-3.5 h-3.5 text-rose-400" />
                  <span>snishad01985@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Single Health Action (Admin Login Button Removed as Requested) */}
            <div className="flex flex-col gap-2 shrink-0">
              <a
                href="/api/settings"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/[0.08] transition-all"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test API Health</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Apple-style Minimal Footer */}
      <footer className="border-t border-white/[0.06] bg-[#000000]/80 px-6 py-4 text-xs text-[#86868b] flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          Movies.snishad Core Engine • Public Open Source
        </p>
        <p>
          Designed &amp; Maintained by{" "}
          <a
            href="https://instagram.com/snishad.me_"
            target="_blank"
            rel="noreferrer"
            className="text-white hover:text-rose-400 transition-colors font-medium"
          >
            SNishad (@snishad.me_)
          </a>
        </p>
      </footer>
    </div>
  );
}


