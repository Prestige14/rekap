"use client";

import React from "react";
import { FileSpreadsheet, KeyRound, Sparkles } from "lucide-react";

interface NavbarProps {
  onOpenSettings: () => void;
  hasApiKey: boolean;
  selectedModel: string;
}

export function Navbar({ onOpenSettings, hasApiKey, selectedModel }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Rekap</h1>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                v1.0
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              Automated Document & Invoice Extractor to Excel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 md:flex">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>AI Model:</span>
            <span className="font-semibold text-slate-800">{selectedModel}</span>
            {hasApiKey ? (
              <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800">
                Active Key
              </span>
            ) : (
              <span className="ml-1 inline-flex items-center rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-medium text-slate-700">
                Local / Sim
              </span>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <KeyRound className="h-3.5 w-3.5 text-slate-500" />
            <span>Pengaturan API</span>
          </button>
        </div>
      </div>
    </header>
  );
}
