"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, ShieldCheck, Heart, Send } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#050508] border-t border-white/5 pt-14 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.jpg"
                alt="Movies.snishad"
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20 shadow-md shadow-black/50"
              />
              <span className="font-display text-2xl tracking-wide text-white uppercase">
                Movies<span className="text-[#e50914]">.snishad</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Your premier entertainment hub. Stream and download the latest Bollywood, Hollywood, South Indian movies, and trending web series in ultra-high fidelity.
            </p>
            <div className="pt-2">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/30 transition-all text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                Join Telegram Channel
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px] text-slate-300">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-white transition-colors">
                  All Movies
                </Link>
              </li>
              <li>
                <Link href="/series" className="hover:text-white transition-colors">
                  Web Series
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-white transition-colors">
                  Trending Top 50
                </Link>
              </li>
              <li>
                <Link href="/new" className="hover:text-white transition-colors">
                  New Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px] text-slate-300">
              Popular Genres
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              <li>
                <Link href="/genre/action" className="hover:text-white transition-colors">
                  Action
                </Link>
              </li>
              <li>
                <Link href="/genre/comedy" className="hover:text-white transition-colors">
                  Comedy
                </Link>
              </li>
              <li>
                <Link href="/genre/drama" className="hover:text-white transition-colors">
                  Drama
                </Link>
              </li>
              <li>
                <Link href="/genre/sci-fi" className="hover:text-white transition-colors">
                  Sci-Fi
                </Link>
              </li>
              <li>
                <Link href="/genre/thriller" className="hover:text-white transition-colors">
                  Thriller
                </Link>
              </li>
              <li>
                <Link href="/genre/horror" className="hover:text-white transition-colors">
                  Horror
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Disclaimer */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px] text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Disclaimer &amp; DMCA
            </h4>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Movies.snishad does not host any media files on its servers. All videos and stream embeds are hosted on third-party public internet services. We respect intellectual property and respond promptly to DMCA notices.
            </p>
          </div>
        </div>

        {/* Developer Credit & Connect Bar */}
        <div className="border-t border-white/5 pt-6 pb-6 my-6 rounded-2xl bg-white/[0.02] border border-white/5 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Created &amp; Maintained by SNishad
              </span>
            </div>
            <p className="text-slate-300 text-xs">
              Want your own website or web app at an affordable price? Connect with me on{" "}
              <a
                href="https://instagram.com/snishad.me_"
                target="_blank"
                rel="noreferrer"
                className="text-pink-400 hover:text-pink-300 underline font-semibold transition-colors"
              >
                Instagram (@snishad.me_)
              </a>{" "}
              or Email{" "}
              <a
                href="mailto:snishad01985@gmail.com"
                className="text-amber-400 hover:text-amber-300 underline font-semibold transition-colors"
              >
                snishad01985@gmail.com
              </a>
            </p>
            <p className="text-slate-500 text-[11px]">
              Found a bug or issue? Report it to me on Instagram — your feedback helps make this platform better!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://instagram.com/snishad.me_"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-medium transition-all"
            >
              Instagram @snishad.me_
            </a>
            <a
              href="mailto:snishad01985@gmail.com"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
            >
              Email Me
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} Movies.snishad. Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            <span>by</span>
            <a
              href="https://instagram.com/snishad.me_"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-rose-400 font-medium underline transition-colors"
            >
              SNishad
            </a>
          </p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            Back to top
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
