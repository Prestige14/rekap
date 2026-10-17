"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, Trash2, RotateCcw } from "lucide-react";
import { DocumentItem } from "@/types/rekap";
import { exportToExcel, exportToCsv } from "@/lib/export";

interface ActionBarProps {
  items: DocumentItem[];
  onClearAll: () => void;
}

export function ActionBar({ items, onClearAll }: ActionBarProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  if (items.length === 0) return null;

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await exportToExcel(items);
    } catch (err) {
      console.error("Export to Excel failed:", err);
      alert("Gagal mengekspor file Excel. Silakan coba lagi.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportCsv = () => {
    try {
      setIsExportingCsv(true);
      exportToCsv(items);
    } catch (err) {
      console.error("Export to CSV failed:", err);
      alert("Gagal mengekspor file CSV. Silakan coba lagi.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700">
          Siap diekspor:
        </span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
          {items.length} Dokumen
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onClearAll}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Semua</span>
        </button>

        <button
          onClick={handleExportCsv}
          disabled={isExportingCsv}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
        >
          <FileText className="h-4 w-4 text-slate-600" />
          <span>Download CSV</span>
        </button>

        <button
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-800 transition active:scale-[0.98] disabled:opacity-50"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>{isExportingExcel ? "Menyiapkan Excel..." : "Download Excel (.xlsx)"}</span>
        </button>
      </div>
    </div>
  );
}
