"use client";

import React, { useState } from "react";
import { X, Key, ShieldCheck, ExternalLink, Check } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  model: string;
  onSave: (apiKey: string, model: string) => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  apiKey: initialApiKey,
  model: initialModel,
  onSave,
}: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState(initialApiKey);
  const [modelInput, setModelInput] = useState(initialModel || "gemini-2.5-flash");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(keyInput.trim(), modelInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setKeyInput("");
    onSave("", modelInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Key className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Pengaturan API Gemini</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Kunci disimpan hanya di browser lokal Anda (localStorage) atau dapat diset melalui{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">GEMINI_API_KEY</code> di{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">.env.local</code>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilihan Model AI
            </label>
            <select
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Sangat Cepat & Akurat)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Stabil)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Akurasi Maksimal)</option>
            </select>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Belum punya API key? Dapatkan secara gratis melalui Google AI Studio.{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-blue-600 hover:underline font-medium"
              >
                Buat Key Gratis <ExternalLink className="h-3 w-3 inline" />
              </a>
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              Hapus Key
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Tersimpan
                  </>
                ) : (
                  "Simpan Pengaturan"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
