"use client";

import React, { useState } from "react";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { DocumentItem } from "@/types/rekap";
import { formatFileSize } from "@/lib/utils";

interface QueueProgressProps {
  items: DocumentItem[];
  isProcessing: boolean;
}

export function QueueProgress({ items, isProcessing }: QueueProgressProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) return null;

  const total = items.length;
  const successCount = items.filter((i) => i.status === "success").length;
  const failedCount = items.filter((i) => i.status === "failed").length;
  const processingCount = items.filter((i) => i.status === "processing").length;
  const queuedCount = items.filter((i) => i.status === "queued").length;

  const completed = successCount + failedCount;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-800">
              Antrean Pemrosesan Dokumen
            </h4>
            {isProcessing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" /> Sedang Mengekstrak...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {completed} dari {total} berkas selesai diproses ({percentage}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">
              <Clock className="h-3 w-3 text-slate-400" /> {queuedCount} Antre
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {successCount} Sukses
            </span>
            {failedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 font-medium text-rose-700">
                <XCircle className="h-3 w-3 text-rose-500" /> {failedCount} Gagal
              </span>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar Horizontal */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Collapsible File Queue List */}
      {isExpanded && (
        <div className="mt-4 max-h-56 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3.5 py-2.5 text-xs transition hover:bg-white"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200/70 text-slate-600">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {item.fileName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatFileSize(item.fileSize)} • {item.fileType.split("/")[1]?.toUpperCase() || "FILE"}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {item.status === "queued" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    <Clock className="h-3 w-3 text-slate-500" /> Menunggu
                  </span>
                )}
                {item.status === "processing" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" /> Membaca...
                  </span>
                )}
                {item.status === "success" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Selesai
                  </span>
                )}
                {item.status === "failed" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-800" title={item.errorMessage}>
                    <XCircle className="h-3 w-3 text-rose-600" /> Gagal
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
