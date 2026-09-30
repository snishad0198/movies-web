"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Upload, Copy, Check } from "lucide-react";

export default function AdminMediaPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadedFiles([data.data, ...uploadedFiles]);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <ImageIcon className="w-7 h-7 text-[#e50914]" />
          <span>Media Storage Manager</span>
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Upload local posters, backdrop banners, and screenshots (stored in /public/uploads).
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-[#0f101c] border-2 border-dashed border-white/15 rounded-3xl p-8 text-center hover:border-[#e50914]/50 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-[#e50914]/10 text-[#e50914] flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-white">Select image to upload</h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
          Supported formats: JPEG, PNG, WebP, AVIF. Max file size: 10MB.
        </p>

        <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-xs cursor-pointer shadow-lg shadow-[#e50914]/20 transition-all">
          <span>{uploading ? "Uploading Image..." : "Choose File to Upload"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Uploaded Media Gallery */}
      <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">
          Session Uploads
        </h2>

        {uploadedFiles.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-sm">
            Uploaded images in this session will appear here with copyable public URLs.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {uploadedFiles.map((file, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img src={file.url} alt="Uploaded" className="w-full h-36 object-cover" />
                <div className="p-2 text-xs text-neutral-300 truncate">{file.filename}</div>
                <button
                  onClick={() => copyToClipboard(file.url)}
                  className="w-full py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedUrl === file.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl === file.url ? "Copied!" : "Copy URL"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
