"use client";

import React from "react";
import { X, ExternalLink, FileText, AlertCircle } from "lucide-react";
import { DocumentItem } from "@/types/rekap";
import { formatCurrency, formatFileSize } from "@/lib/utils";

interface DocumentPreviewModalProps {
  item: DocumentItem | null;
  onClose: () => void;
}

export function DocumentPreviewModal({
  item,
  onClose,
}: DocumentPreviewModalProps) {
  if (!item) return null;

  const isPdf =
    item.fileType === "application/pdf" ||
    item.fileName.toLowerCase().endsWith(".pdf");
  const isImage =
    item.fileType.startsWith("image/") ||
    /\.(png|jpe?g|webp)$/i.test(item.fileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900">
                {item.fileName}
              </h3>
              <p className="text-xs text-slate-500">
                {formatFileSize(item.fileSize)} • Status:{" "}
                <span className="font-semibold text-slate-700 capitalize">
                  {item.status}
                </span>{" "}
                • Keyakinan AI:{" "}
                <span
                  className={
                    item.confidence === "high"
                      ? "text-emerald-700 font-semibold"
                      : item.confidence === "medium"
                      ? "text-amber-700 font-semibold"
                      : "text-rose-700 font-semibold"
                  }
                >
                  {item.confidence.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.fileDataUrl && (
              <a
                href={item.fileDataUrl}
                target="_blank"
                rel="noreferrer"
                download={item.fileName}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                <span>Buka Berkas</span>
              </a>
            )}
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split View (Document Viewer on Left, Extracted Fields on Right) */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* Left: Document View */}
          <div className="flex flex-1 items-center justify-center p-4 overflow-auto bg-slate-900/5">
            {item.fileDataUrl ? (
              isPdf ? (
                <iframe
                  src={item.fileDataUrl}
                  className="h-full w-full rounded-xl border border-slate-300 bg-white shadow-sm"
                  title="PDF Preview"
                />
              ) : isImage ? (
                <div className="relative max-h-full max-w-full overflow-auto rounded-xl border border-slate-300 bg-white p-2 shadow-sm flex items-center justify-center">
                  <img
                    src={item.fileDataUrl}
                    alt={item.fileName}
                    className="max-h-[75vh] w-auto object-contain rounded"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <FileText className="h-12 w-12 text-slate-400 mb-2" />
                  <p className="text-sm">Pratinjau langsung tidak tersedia untuk format berkas ini.</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                <p className="text-sm font-medium text-slate-700">Berkas ini adalah contoh simulasi</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Unggah berkas nyata melalui area upload untuk melihat dokumen visual asli di sini.
                </p>
              </div>
            )}
          </div>

          {/* Right: Extracted Data Verification Panel */}
          <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-200 bg-white p-5 overflow-y-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Data Terverifikasi
            </h4>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="block text-slate-500 text-[11px]">Nomor Invoice / Bukti</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {item.extractedData.invoiceNumber || "-"}
                </span>
              </div>

              <div>
                <span className="block text-slate-500 text-[11px]">Nama Vendor / Penerbit</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {item.extractedData.vendorName || "-"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-slate-500 text-[11px]">Tanggal Dokumen</span>
                  <span className="font-medium text-slate-800">
                    {item.extractedData.issueDate || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[11px]">Jatuh Tempo</span>
                  <span className="font-medium text-slate-800">
                    {item.extractedData.dueDate || "-"}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-slate-500 text-[11px]">Kategori</span>
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  {item.extractedData.category || "Umum"}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(item.extractedData.subtotal, item.extractedData.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pajak (PPN):</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(item.extractedData.tax, item.extractedData.currency)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Nominal:</span>
                  <span className="text-blue-700">
                    {formatCurrency(item.extractedData.totalAmount, item.extractedData.currency)}
                  </span>
                </div>
              </div>

              {item.extractedData.notes && (
                <div>
                  <span className="block text-slate-500 text-[11px]">Keterangan / Catatan</span>
                  <p className="mt-0.5 rounded-lg bg-slate-50 p-2.5 text-slate-600 italic border border-slate-100 leading-relaxed">
                    &ldquo;{item.extractedData.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
