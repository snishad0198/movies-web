"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Film, Tv, Flame, Sparkles, Menu, X, Compass } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Movies", href: "/movies", icon: Film },
    { name: "Web Series", href: "/series", icon: Tv },
    { name: "Anime", href: "/anime", icon: Sparkles },
    { name: "Trending", href: "/trending", icon: Flame },
    { name: "New Releases", href: "/new", icon: Compass },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#08080c]/95 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl"
          : "bg-[#08080c]/85 sm:bg-gradient-to-b sm:from-[#08080c]/95 sm:via-[#08080c]/75 sm:to-[#08080c]/20 backdrop-blur-md border-b border-white/5 py-3.5 sm:py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <img
            src="/logo.jpg"
            alt="Movies.snishad"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-white/20 group-hover:ring-[#e50914] shadow-md shadow-black/50 transition-all"
          />
          <span className="font-display text-2xl sm:text-3xl tracking-wide text-white uppercase group-hover:text-red-500 transition-colors">
            Movies<span className="text-[#e50914]">.snishad</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#e50914] text-white shadow-md shadow-red-600/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, series..."
              className="w-full bg-[#161622]/90 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Mobile search button */}
          <Link
            href="/search"
            className="sm:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c14] border-b border-white/10 px-4 py-4 mt-2 space-y-3 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, series..."
              className="w-full bg-[#161622] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#e50914]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#e50914] text-white"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

