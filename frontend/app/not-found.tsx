import Link from "next/link";
import { Film, Home, Search, Compass, Instagram, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-950/20">
          <Film className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-rose-500 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Movie or Page Not Found
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            The title or page you are looking for may have been moved, renamed, or is currently unavailable. Try searching for it or exploring our trending catalog!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-semibold text-sm shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-semibold text-sm transition-all hover:scale-105"
          >
            <Search className="w-4 h-4" />
            <span>Search Movies</span>
          </Link>
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-semibold text-sm transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Trending</span>
          </Link>
        </div>

        {/* Report / Credit */}
        <div className="pt-6 border-t border-white/5 text-xs text-slate-500 space-y-2">
          <p>
            Think this is a broken link? Report it to me on Instagram{" "}
            <a
              href="https://instagram.com/snishad.me_"
              target="_blank"
              rel="noreferrer"
              className="text-pink-400 hover:underline font-medium"
            >
              @snishad.me_
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
