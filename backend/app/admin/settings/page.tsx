"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  Shield,
  Play,
  DownloadCloud,
  Megaphone,
  Share2,
  Palette,
  Layout,
  Key,
  FlaskConical,
  AlertCircle,
  Eye,
  Film,
  ExternalLink,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance");
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Settings State
  const [formData, setFormData] = useState<any>({
    siteName: "Movies.snishad",
    tagline: "Watch & Download Free HD Movies & Series",
    logo: "/logo.jpg",
    favicon: "/favicon.ico",
    footerText:
      "Movies.snishad is a premier entertainment index. All media files are indexed from third-party streaming cloud servers.",
    itemsPerPage: 20,

    // Theme Colors
    primaryColor: "#e50914",
    accentColor: "#ff1f2d",
    backgroundColor: "#08080c",
    cardColor: "#121218",
    textColor: "#f8fafc",

    // Announcement & Layout
    announcementText:
      "Welcome to Movies.snishad! Stream latest Bollywood, Hollywood, and South Indian cinema in HD.",
    announcementLink: "https://t.me/",
    announcementActive: false,
    customLinks: "[]",
    layoutStyle: "modern",

    // Player & Downloader
    playerType: "plyr",
    autoplay: true,
    watermark: "Movies.snishad",
    downloadApiUrl: "https://02moviedownloader.top/",
    tmdbApiKey: "",

    // Ads
    adsEnabled: false,
    adsenseId: "",
    adHeader: "",
    adAfterHero: "",
    adSidebar: "",
    adInContent: "",
    adBeforePlayer: "",
    adFooter: "",

    // Social
    socialFacebook: "",
    socialInstagram: "",
    socialTwitter: "",
    socialYoutube: "",
    socialTelegram: "https://t.me/",
    socialWhatsapp: "",

    // Security
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    maintenanceMode: false,
    maintenanceMsg:
      "We are upgrading our cloud streaming infrastructure. Please check back shortly.",
  });

  // Password / Credentials State
  const [credCurrentPassword, setCredCurrentPassword] = useState("");
  const [credNewEmail, setCredNewEmail] = useState("");
  const [credNewPassword, setCredNewPassword] = useState("");
  const [credLoading, setCredLoading] = useState(false);
  const [credMessage, setCredMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Test Download API tool
  const [testMovieTitle, setTestMovieTitle] = useState("Fighter");
  const [testMovieYear, setTestMovieYear] = useState("2024");
  const [testApiResult, setTestApiResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // TMDB Test State
  const [testTmdbLoading, setTestTmdbLoading] = useState(false);
  const [testTmdbResult, setTestTmdbResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTmdbKey, setShowTmdbKey] = useState(false);

  const handleTestTmdbKey = async () => {
    setTestTmdbLoading(true);
    setTestTmdbResult(null);
    try {
      const res = await fetch("/api/admin/tmdb-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: formData.tmdbApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setTestTmdbResult({ success: true, message: data.message });
      } else {
        setTestTmdbResult({ success: false, message: data.error || "Invalid TMDB API key" });
      }
    } catch (e: any) {
      setTestTmdbResult({ success: false, message: `Connection error: ${e.message}` });
    } finally {
      setTestTmdbLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          setFormData((prev: any) => ({ ...prev, ...j.data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedMessage(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3500);
      } else {
        alert(data.error || "Save failed");
      }
    } catch {
      alert("Network error. Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);
    setCredLoading(true);

    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: credCurrentPassword,
          newEmail: credNewEmail.trim() || undefined,
          newPassword: credNewPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCredMessage({
          type: "success",
          text: data.message || "Credentials updated successfully!",
        });
        setCredCurrentPassword("");
        setCredNewPassword("");
      } else {
        setCredMessage({
          type: "error",
          text: data.error || "Failed to update credentials",
        });
      }
    } catch {
      setCredMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setCredLoading(false);
    }
  };

  const handleTestDownloadApi = async () => {
    setTestLoading(true);
    setTestApiResult(null);
    try {
      const res = await fetch(
        `/api/download?title=${encodeURIComponent(testMovieTitle)}&year=${encodeURIComponent(
          testMovieYear
        )}`
      );
      const data = await res.json();
      setTestApiResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTestApiResult(`Error: ${e.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  const applyColorPreset = (preset: {
    primary: string;
    accent: string;
    bg: string;
    card: string;
    text: string;
  }) => {
    setFormData((prev: any) => ({
      ...prev,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      backgroundColor: preset.bg,
      cardColor: preset.card,
      textColor: preset.text,
    }));
  };

  const tabs = [
    { id: "appearance", label: "Theme & Colors", icon: Palette },
    { id: "content", label: "Text, Banner & Layout", icon: Layout },
    { id: "general", label: "Logo & Branding", icon: Settings },
    { id: "auth", label: "Admin Password & Login", icon: Key },
    { id: "player", label: "Video Player", icon: Play },
    { id: "download", label: "Download API", icon: DownloadCloud },
    { id: "tmdb", label: "TMDB API & Sync", icon: Film },
    { id: "ads", label: "Ad Networks", icon: Megaphone },
    { id: "social", label: "Social Links", icon: Share2 },
    { id: "security", label: "Security & Firewall", icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-[#e50914]" />
            <span>Site Configuration &amp; Control Center</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Customize platform colors, text, layouts, links, and secure administrator credentials.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-sm shadow-lg shadow-[#e50914]/25 disabled:opacity-50 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Applying Changes..." : "Save Settings"}</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Settings saved and instantly deployed to the public site!</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#e50914] text-white shadow-lg shadow-[#e50914]/25 scale-[1.02]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 shadow-xl">
        {/* TAB: APPEARANCE & COLORS */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#e50914]" />
                <span>Custom Color Palette &amp; Visual Theme</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Change primary colors, accent tones, and container backgrounds across the entire website in real-time.
              </p>
            </div>

            {/* Presets */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Quick Theme Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {[
                  {
                    name: "Snishad Red",
                    primary: "#e50914",
                    accent: "#ff1f2d",
                    bg: "#08080c",
                    card: "#121218",
                    text: "#f8fafc",
                  },
                  {
                    name: "Netflix Crimson",
                    primary: "#dc2626",
                    accent: "#ef4444",
                    bg: "#0a0a0a",
                    card: "#171717",
                    text: "#ffffff",
                  },
                  {
                    name: "Cyber Neon Blue",
                    primary: "#2563eb",
                    accent: "#38bdf8",
                    bg: "#060b17",
                    card: "#0f172a",
                    text: "#f1f5f9",
                  },
                  {
                    name: "Emerald Luxury",
                    primary: "#059669",
                    accent: "#10b981",
                    bg: "#04130d",
                    card: "#0a2218",
                    text: "#ecfdf5",
                  },
                  {
                    name: "Royal Velvet",
                    primary: "#7c3aed",
                    accent: "#a855f7",
                    bg: "#0d0817",
                    card: "#180f2a",
                    text: "#faf5ff",
                  },
                  {
                    name: "Golden Cinema",
                    primary: "#d97706",
                    accent: "#f59e0b",
                    bg: "#0d0b07",
                    card: "#1c1810",
                    text: "#fffbeb",
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyColorPreset(preset)}
                    className="p-3 rounded-xl border border-white/10 hover:border-white/30 text-left transition-all bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset.accent }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset.card }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-white block">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Primary Color */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor || "#e50914"}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor || "#e50914"}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Accent &amp; Glow Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accentColor || "#ff1f2d"}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.accentColor || "#ff1f2d"}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Main Page Background
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.backgroundColor || "#08080c"}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor || "#08080c"}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Card Color */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Card &amp; Box Surface Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.cardColor || "#121218"}
                    onChange={(e) => handleChange("cardColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.cardColor || "#121218"}
                    onChange={(e) => handleChange("cardColor", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Primary Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.textColor || "#f8fafc"}
                    onChange={(e) => handleChange("textColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.textColor || "#f8fafc"}
                    onChange={(e) => handleChange("textColor", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Live Palette Visualizer */}
            <div
              className="p-6 rounded-2xl border transition-all"
              style={{
                backgroundColor: formData.backgroundColor || "#08080c",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <span className="text-xs font-bold uppercase tracking-wider block mb-3 text-neutral-400">
                Live Theme Preview
              </span>
              <div
                className="p-4 rounded-xl border max-w-sm"
                style={{
                  backgroundColor: formData.cardColor || "#121218",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <span
                    className="font-bold text-sm"
                    style={{ color: formData.textColor || "#ffffff" }}
                  >
                    Cinema Card Title
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-3">
                  This preview renders your chosen surface background, accent buttons, and text contrast.
                </p>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md cursor-pointer"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  Watch Stream
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CONTENT, TEXT, ANNOUNCEMENT & LAYOUT */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#e50914]" />
                <span>Text, Announcement Banner &amp; Layout Controls</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Customize site titles, top announcement banner, custom links, and layout style.
              </p>
            </div>

            {/* Announcement Banner Section */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Top Announcement Banner</h3>
                  <p className="text-xs text-neutral-400">
                    Display an urgent marquee or notice banner at the very top of the website.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="announcementActive"
                    checked={formData.announcementActive}
                    onChange={(e) => handleChange("announcementActive", e.target.checked)}
                    className="w-5 h-5 accent-[#e50914] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="announcementActive"
                    className="text-xs font-semibold text-white cursor-pointer"
                  >
                    Enable Banner
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Announcement Text
                </label>
                <input
                  type="text"
                  value={formData.announcementText || ""}
                  onChange={(e) => handleChange("announcementText", e.target.value)}
                  placeholder="Welcome to Movies.snishad! Watch and download HD Bollywood & Hollywood movies."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Banner Action Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.announcementLink || ""}
                  onChange={(e) => handleChange("announcementLink", e.target.value)}
                  placeholder="https://t.me/yourchannel or /movies"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            {/* Layout Style */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white">Catalog Display Layout</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "modern",
                    title: "Modern Cinema",
                    desc: "Sleek hero banner, category pills, responsive poster grid.",
                  },
                  {
                    id: "netflix",
                    title: "Netflix Horizontal Rows",
                    desc: "Category rows with horizontal scroll and backdrop banners.",
                  },
                  {
                    id: "compact",
                    title: "Compact Density",
                    desc: "Maximizes poster count per screen with tight spacing.",
                  },
                ].map((style) => {
                  const isSelected = (formData.layoutStyle || "modern") === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleChange("layoutStyle", style.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#e50914]/15 border-[#e50914] text-white shadow-lg"
                          : "bg-white/[0.02] border-white/10 text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <span className="font-bold text-xs text-white block mb-1">
                        {style.title}
                      </span>
                      <span className="text-[11px] leading-relaxed block">{style.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Links */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-white">Custom Header Navigation Links</h3>
              <p className="text-xs text-neutral-400">
                JSON list of extra navigation links in the header, e.g.:{" "}
                <code className="text-rose-400">
                  [{`{"name": "Telegram", "href": "https://t.me/"}`}]
                </code>
              </p>
              <textarea
                rows={3}
                value={formData.customLinks || "[]"}
                onChange={(e) => handleChange("customLinks", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB: LOGO & BRANDING */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#e50914]" />
                <span>Branding, Logo &amp; Identity</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Manage website name, authentic old logo, favicon, and footer copyright text.
              </p>
            </div>

            {/* Logo and Favicon Preview Box */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
                    Site Logo
                  </span>
                  <img
                    src={formData.logo || "/logo.jpg"}
                    alt="Logo Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg mx-auto"
                    onError={(e: any) => {
                      e.target.src = "/logo.jpg";
                    }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
                    Favicon Icon
                  </span>
                  <img
                    src={formData.favicon || "/favicon.ico"}
                    alt="Favicon Preview"
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20 shadow-md mx-auto"
                    onError={(e: any) => {
                      e.target.src = "/favicon.ico";
                    }}
                  />
                </div>
              </div>
              <div className="text-xs text-neutral-400 leading-relaxed sm:border-l sm:border-white/10 sm:pl-6 flex-1">
                <p className="text-white font-semibold mb-1">Authentic Image Asset Loaded</p>
                <p>
                  Sourced from the original database:{" "}
                  <code className="text-neutral-300">
                    https://i.ibb.co/xKTs0n1x/18101784373776709.jpg
                  </code>
                  . Also saved locally in <code className="text-neutral-300">/logo.jpg</code> and{" "}
                  <code className="text-neutral-300">/favicon.ico</code>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Site Name
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Logo URL or Local Path
                </label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => handleChange("logo", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Favicon URL or Local Path
                </label>
                <input
                  type="text"
                  value={formData.favicon}
                  onChange={(e) => handleChange("favicon", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Footer Disclaimer Text
              </label>
              <textarea
                rows={3}
                value={formData.footerText}
                onChange={(e) => handleChange("footerText", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
              />
            </div>
          </div>
        )}

        {/* TAB: ADMIN CREDENTIALS & PASSWORD */}
        {activeTab === "auth" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#e50914]" />
                <span>Administrator Credentials &amp; Access</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Change your administrator email and update your secret login password securely.
              </p>
            </div>

            {/* Current Active Credentials Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Active Master Admin
              </span>
              <div className="text-xs text-white">
                Email: <span className="font-mono text-rose-400">admin@moviessnishad.com</span>
              </div>
              <div className="text-xs text-white">
                Default Secret: <span className="font-mono text-rose-400">Admin@123456</span>
              </div>
              <div className="text-[11px] text-neutral-400 pt-1">
                Admin Panel Direct URL:{" "}
                <code className="text-neutral-300">http://localhost:3000/admin</code> (Not visible
                on public landing page)
              </div>
            </div>

            {credMessage && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  credMessage.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                }`}
              >
                {credMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{credMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCredentialUpdate} className="space-y-4 max-w-lg" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Current Password (Required for any changes)
                </label>
                <input
                  type="password"
                  value={credCurrentPassword}
                  onChange={(e) => setCredCurrentPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  New Admin Email (Optional)
                </label>
                <input
                  type="email"
                  value={credNewEmail}
                  onChange={(e) => setCredNewEmail(e.target.value)}
                  autoComplete="off"
                  placeholder="Leave blank to keep current email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  New Password (Optional, min 6 characters)
                </label>
                <input
                  type="password"
                  value={credNewPassword}
                  onChange={(e) => setCredNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={credLoading}
                className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs shadow-md shadow-[#e50914]/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                {credLoading ? "Updating..." : "Update Admin Credentials"}
              </button>
            </form>
          </div>
        )}

        {/* TAB: VIDEO PLAYER */}
        {activeTab === "player" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-[#e50914]" />
              <span>Cinema Video Player Configuration</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Default Player Engine
                </label>
                <select
                  value={formData.playerType}
                  onChange={(e) => handleChange("playerType", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                >
                  <option value="plyr">Plyr.js Cinema Engine</option>
                  <option value="iframe">Multi-Server Responsive Iframe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={formData.watermark}
                  onChange={(e) => handleChange("watermark", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoplay"
                checked={formData.autoplay}
                onChange={(e) => handleChange("autoplay", e.target.checked)}
                className="w-4 h-4 accent-[#e50914] rounded cursor-pointer"
              />
              <label
                htmlFor="autoplay"
                className="text-xs text-neutral-300 font-semibold cursor-pointer"
              >
                Autoplay video when server switches
              </label>
            </div>
          </div>
        )}

        {/* TAB: DOWNLOAD API */}
        {activeTab === "download" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <DownloadCloud className="w-4 h-4 text-[#e50914]" />
                <span>02moviedownloader.top API Integration</span>
              </h2>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={formData.downloadApiUrl}
                  onChange={(e) => handleChange("downloadApiUrl", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            {/* Test API Live Tool */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-400" />
                <span>Live Download API Tester</span>
              </div>
              <p className="text-xs text-neutral-400">
                Test query upstream API server-side to verify response formatting and links.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={testMovieTitle}
                  onChange={(e) => setTestMovieTitle(e.target.value)}
                  placeholder="Movie Title (e.g. Fighter)"
                  className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                />
                <input
                  type="text"
                  value={testMovieYear}
                  onChange={(e) => setTestMovieYear(e.target.value)}
                  placeholder="Year (e.g. 2024)"
                  className="w-full sm:w-28 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleTestDownloadApi}
                  disabled={testLoading}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {testLoading ? "Testing..." : "Test Upstream"}
                </button>
              </div>

              {testApiResult && (
                <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-emerald-400 overflow-x-auto max-h-60 font-mono">
                  {testApiResult}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* TAB: TMDB API & SYNC */}
        {activeTab === "tmdb" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Film className="w-4 h-4 text-[#e50914]" />
                <span>The Movie Database (TMDB) API Configuration</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Powers real-time hourly trending syncing, poster artwork, synopsis, cast details, and global search index.
              </p>
            </div>

            {/* Public Repo Protection Notice */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-300 leading-relaxed">
                <strong className="text-white block mb-0.5">Zero-Exposure Credential Security</strong>
                Your TMDB API key is securely saved directly in your private database. When you push your code to GitHub or public repositories, the repository and <code className="text-blue-300 bg-blue-500/20 px-1 py-0.5 rounded">.env.example</code> remain safe with demo placeholders only.
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-400">
                    TMDB v3 API Key
                  </label>
                  <a
                    href="https://www.themoviedb.org/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#e50914] hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Get Free TMDB API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showTmdbKey ? "text" : "password"}
                    value={formData.tmdbApiKey || ""}
                    onChange={(e) => handleChange("tmdbApiKey", e.target.value)}
                    placeholder="Enter your 32-character TMDB API Key (e.g. fed869564...)"
                    className="w-full px-3.5 py-2.5 pr-20 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-[#e50914]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTmdbKey(!showTmdbKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-white/5 cursor-pointer"
                  >
                    {showTmdbKey ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Leave blank to fall back to the TMDB_API_KEY environment variable in your local .env file.
                </p>
              </div>

              {/* Test TMDB Key Tool */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Verify TMDB API Connection
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Tests live communication with TMDB API endpoints using your active key.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestTmdbKey}
                    disabled={testTmdbLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs shadow-md shadow-[#e50914]/20 disabled:opacity-50 cursor-pointer transition-all"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>{testTmdbLoading ? "Testing..." : "Test Connection"}</span>
                  </button>
                </div>

                {testTmdbResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                      testTmdbResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {testTmdbResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{testTmdbResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ADS */}
        {activeTab === "ads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#e50914]" />
                  <span>Ad Placements &amp; Google AdSense</span>
                </h2>
                <p className="text-xs text-neutral-400">Inject custom ad banners across pages</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="adsEnabled"
                  checked={formData.adsEnabled}
                  onChange={(e) => handleChange("adsEnabled", e.target.checked)}
                  className="w-5 h-5 accent-[#e50914] rounded cursor-pointer"
                />
                <label htmlFor="adsEnabled" className="text-sm text-white font-bold cursor-pointer">
                  Enable Ads Master Switch
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Header Top Banner Ad (Desktop / Mobile)
              </label>
              <textarea
                rows={2}
                value={formData.adHeader || ""}
                onChange={(e) => handleChange("adHeader", e.target.value)}
                placeholder="<script ...> or <iframe> ad code"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Before Player Ad (High CPM)
              </label>
              <textarea
                rows={2}
                value={formData.adBeforePlayer || ""}
                onChange={(e) => handleChange("adBeforePlayer", e.target.value)}
                placeholder="<script ...> or <iframe> ad code"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Footer Banner Ad
              </label>
              <textarea
                rows={2}
                value={formData.adFooter || ""}
                onChange={(e) => handleChange("adFooter", e.target.value)}
                placeholder="<script ...> or <iframe> ad code"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB: SOCIAL */}
        {activeTab === "social" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#e50914]" />
              <span>Social Community Channels</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Telegram Channel
                </label>
                <input
                  type="text"
                  value={formData.socialTelegram || ""}
                  onChange={(e) => handleChange("socialTelegram", e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  YouTube Channel
                </label>
                <input
                  type="text"
                  value={formData.socialYoutube || ""}
                  onChange={(e) => handleChange("socialYoutube", e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#e50914]" />
              <span>Security, Rate-Limiting &amp; Maintenance</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Max Login Attempts Before Lockout
                </label>
                <input
                  type="number"
                  value={formData.maxLoginAttempts}
                  onChange={(e) => handleChange("maxLoginAttempts", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Lockout Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={formData.lockoutDuration}
                  onChange={(e) => handleChange("lockoutDuration", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                  className="w-4 h-4 accent-[#e50914] rounded cursor-pointer"
                />
                <label
                  htmlFor="maintenanceMode"
                  className="text-sm text-amber-300 font-bold cursor-pointer"
                >
                  Activate Maintenance Mode (Visitors see maintenance screen)
                </label>
              </div>

              {formData.maintenanceMode && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                    Maintenance Message
                  </label>
                  <textarea
                    rows={2}
                    value={formData.maintenanceMsg || ""}
                    onChange={(e) => handleChange("maintenanceMsg", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
