"use client";

import React, { useState } from "react";
import {
  Eye,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { DocumentItem, ExtractedData } from "@/types/rekap";
import { formatCurrency, cleanNumericValue } from "@/lib/utils";

interface SpreadsheetTableProps {
  items: DocumentItem[];
  onUpdateItem: (id: string, updatedData: Partial<ExtractedData>) => void;
  onDeleteItem: (id: string) => void;
  onAddNewRow: () => void;
  onPreviewItem: (item: DocumentItem) => void;
}

export function SpreadsheetTable({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddNewRow,
  onPreviewItem,
}: SpreadsheetTableProps) {
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof ExtractedData;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const startEditing = (id: string, field: keyof ExtractedData, initialVal: any) => {
    setEditingCell({ id, field });
    setTempValue(initialVal !== undefined && initialVal !== null ? String(initialVal) : "");
  };

  const commitEditing = (id: string, field: keyof ExtractedData) => {
    if (!editingCell) return;

    if (field === "subtotal" || field === "tax" || field === "totalAmount") {
      const num = cleanNumericValue(tempValue);
      onUpdateItem(id, { [field]: num });
    } else {
      onUpdateItem(id, { [field]: tempValue.trim() });
    }

    setEditingCell(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    id: string,
    field: keyof ExtractedData
  ) => {
    if (e.key === "Enter") {
      commitEditing(id, field);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-3">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Tabel Rekap Masih Kosong</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Unggah dokumen atau klik &ldquo;Muat Contoh Data Cepat&rdquo; untuk memulai ekstraksi otomatis.
        </p>
        <button
          onClick={onAddNewRow}
          type="button"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 text-slate-500" />
          <span>Tambah Baris Manual</span>
        </button>
      </div>
    );
  }

  // Calculate summary metrics
  const totalSubtotal = items.reduce((acc, i) => acc + (i.extractedData.subtotal || 0), 0);
  const totalTax = items.reduce((acc, i) => acc + (i.extractedData.tax || 0), 0);
  const grandTotal = items.reduce((acc, i) => acc + (i.extractedData.totalAmount || 0), 0);

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800">
            Tabel Review & Koreksi Interaktif
          </h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {items.length} Baris
          </span>
        </div>

        <button
          onClick={onAddNewRow}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 text-blue-600" />
          <span>Tambah Baris</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-900 text-slate-100 font-semibold tracking-wide">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-44">Berkas Dokumen</th>
                <th className="py-3 px-3 w-36">No. Invoice</th>
                <th className="py-3 px-3 w-44">Vendor / Penerbit</th>
                <th className="py-3 px-3 w-28">Tanggal</th>
                <th className="py-3 px-3 w-28">Jatuh Tempo</th>
                <th className="py-3 px-3 w-32">Kategori</th>
                <th className="py-3 px-3 w-32 text-right">Subtotal (Rp)</th>
                <th className="py-3 px-3 w-28 text-right">Pajak (Rp)</th>
                <th className="py-3 px-3 w-36 text-right">Total (Rp)</th>
                <th className="py-3 px-3 w-24 text-center">Keyakinan</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {items.map((item, index) => {
                const isNeedsAttention =
                  item.confidence === "low" ||
                  !item.extractedData.totalAmount ||
                  !item.extractedData.invoiceNumber;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group hover:bg-blue-50/40 ${
                      isNeedsAttention ? "bg-amber-50/50" : index % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                    }`}
                  >
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {/* File preview button & name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPreviewItem(item)}
                          title="Lihat Pratinjau Dokumen Asli"
                          type="button"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 shadow-xs transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <span className="truncate font-medium text-slate-800 max-w-[140px]" title={item.fileName}>
                          {item.fileName}
                        </span>
                      </div>
                    </td>

                    {/* Invoice Number */}
                    <td
                      onClick={() => startEditing(item.id, "invoiceNumber", item.extractedData.invoiceNumber)}
                      className="py-2.5 px-3 cursor-pointer"
                    >
                      {editingCell?.id === item.id && editingCell.field === "invoiceNumber" ? (
                        <input
                          autoFocus
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => commitEditing(item.id, "invoiceNumber")}
                          onKeyDown={(e) => handleKeyDown(e, item.id, "invoiceNumber")}
                          className="w-full rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-slate-900 hover:underline">
                          {item.extractedData.invoiceNumber || (
                            <span className="text-amber-600 italic">Belum diisi</span>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Vendor Name */}
                    <td
                      onClick={() => startEditing(item.id, "vendorName", item.extractedData.vendorName)}
                      className="py-2.5 px-3 cursor-pointer"
                    >
                      {editingCell?.id === item.id && editingCell.field === "vendorName" ? (
                        <input
                          autoFocus
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => commitEditing(item.id, "vendorName")}
                          onKeyDown={(e) => handleKeyDown(e, item.id, "vendorName")}
                          className="w-full rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span className="font-medium text-slate-900 hover:underline">
                          {item.extractedData.vendorName || (
                            <span className="text-amber-600 italic">Belum diisi</span>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Issue Date */}
                    <td
                      onClick={() => startEditing(item.id, "issueDate", item.extractedData.issueDate)}
                      className="py-2.5 px-3 cursor-pointer"
                    >
                      {editingCell?.id === item.id && editingCell.field === "issueDate" ? (
                        <input
                          autoFocus
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => commitEditing(item.id, "issueDate")}
                          onKeyDown={(e) => handleKeyDown(e, item.id, "issueDate")}
                          className="w-full rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span className="text-slate-700 hover:underline">
                          {item.extractedData.issueDate || "-"}
                        </span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td
                      onClick={() => startEditing(item.id, "dueDate", item.extractedData.dueDate)}
                      className="py-2.5 px-3 cursor-pointer"
                    >
                      {editingCell?.id === item.id && editingCell.field === "dueDate" ? (
                        <input
                          autoFocus
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => commitEditing(item.id, "dueDate")}
                          onKeyDown={(e) => handleKeyDown(e, item.id, "dueDate")}
                          className="w-full rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span className="text-slate-600 hover:underline">
                          {item.extractedData.dueDate || "-"}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td
                      onClick={() => startEditing(item.id, "category", item.extractedData.category)}
                      className="py-2.5 px-3 cursor-pointer"
                    >
                      {editingCell?.id === item.id && editingCell.field === "category" ? (
                        <input
                          autoFocus
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => commitEditing(item.id, "category")}
                          onKeyDown={(e) => handleKeyDown(e, item.id, "category")}
                          className="w-full rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span className="inline-block rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700 hover:bg-slate-200">
                          {item.extractedData.category || "Umum"}
                        </span>
                      )}
                    </td>

                    {/* Subtotal */}
                    <td
                      onClick={() => startEditing(item.id, "subtotal", item.extractedData.subtotal)}
                      className="py-2.5 px-3 text-right cursor-pointer"
                    >
                      {editingCell?.id === item.id && editingCell.field === "subtotal" ? (
                        <input
                          autoFocus
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => commitEditing(item.id, "subtotal")}
                          onKeyDown={(e) => handleKeyDown(e, item.id, "subtotal")}
                          className="w-full text-right rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-slate-700 hover:underline">
                          {formatCurrency(item.extractedData.subtotal, item.extractedData.currency)}
                        </span>
                      )}
                    </td>

                    {/* Tax */}
                    <td
                      onClick={() => startEditing(item.id, "tax", item.extractedData.tax)}
                      className="py-2.5 px-3 text-right cursor-pointer"
                    >
                      {editingCell?.id === item.id && editingCell.field === "tax" ? (
                        <input
                          autoFocus
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => commitEditing(item.id, "tax")}
                          onKeyDown={(e) => handleKeyDown(e, item.id, "tax")}
                          className="w-full text-right rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-slate-700 hover:underline">
                          {formatCurrency(item.extractedData.tax, item.extractedData.currency)}
                        </span>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td
                      onClick={() => startEditing(item.id, "totalAmount", item.extractedData.totalAmount)}
                      className="py-2.5 px-3 text-right cursor-pointer"
                    >
                      {editingCell?.id === item.id && editingCell.field === "totalAmount" ? (
                        <input
                          autoFocus
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => commitEditing(item.id, "totalAmount")}
                          onKeyDown={(e) => handleKeyDown(e, item.id, "totalAmount")}
                          className="w-full text-right rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-900 hover:underline">
                          {formatCurrency(item.extractedData.totalAmount, item.extractedData.currency)}
                        </span>
                      )}
                    </td>

                    {/* Confidence Score */}
                    <td className="py-2.5 px-3 text-center">
                      {item.confidence === "high" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> High
                        </span>
                      )}
                      {item.confidence === "medium" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          <AlertTriangle className="h-3 w-3 text-amber-600" /> Med
                        </span>
                      )}
                      {item.confidence === "low" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          <AlertTriangle className="h-3 w-3 text-rose-600" /> Low
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        type="button"
                        title="Hapus baris"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Summary Footer */}
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100/90 font-bold text-slate-900">
                <td colSpan={7} className="py-3 px-3 text-right uppercase tracking-wider text-slate-600 text-[11px]">
                  Total Keseluruhan ({items.length} Dokumen):
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-800">
                  {formatCurrency(totalSubtotal)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-800">
                  {formatCurrency(totalTax)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-base font-extrabold text-blue-700">
                  {formatCurrency(grandTotal)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
