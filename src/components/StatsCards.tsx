"use client";

import React from "react";
import { Receipt, Wallet, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { DocumentItem } from "@/types/rekap";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  items: DocumentItem[];
}

export function StatsCards({ items }: StatsCardsProps) {
  if (items.length === 0) return null;

  const totalDocs = items.length;
  const successDocs = items.filter((i) => i.status === "success").length;
  const totalAmount = items.reduce((acc, i) => acc + (i.extractedData.totalAmount || 0), 0);
  const totalTax = items.reduce((acc, i) => acc + (i.extractedData.tax || 0), 0);
  const avgAmount = totalDocs > 0 ? Math.round(totalAmount / totalDocs) : 0;

  const needsAttentionCount = items.filter(
    (i) =>
      i.confidence === "low" ||
      !i.extractedData.totalAmount ||
      !i.extractedData.invoiceNumber
  ).length;

  const highConfidenceCount = items.filter((i) => i.confidence === "high").length;
  const highConfidenceRate = totalDocs > 0 ? Math.round((highConfidenceCount / totalDocs) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Dokumen */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Dokumen</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {totalDocs}
          </span>
          <span className="text-xs text-slate-500 font-medium">berkas</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          {successDocs} terekstrak ({Math.round((successDocs / totalDocs) * 100)}%)
        </p>
      </div>

      {/* Akumulasi Total */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Pengeluaran</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Termasuk PPN/Pajak {formatCurrency(totalTax)}
        </p>
      </div>

      {/* Rata-rata Pengeluaran */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Rata-rata per Berkas</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(avgAmount)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Estimasi rata-rata transaksi
        </p>
      </div>

      {/* Status Verifikasi / Akurasi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Kualitas Ekstraksi</span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              needsAttentionCount > 0 ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600"
            }`}
          >
            {needsAttentionCount > 0 ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {highConfidenceRate}%
          </span>
          <span className="text-xs text-emerald-600 font-semibold">Akurat</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          {needsAttentionCount > 0 ? (
            <span className="text-amber-600 font-medium">
              {needsAttentionCount} baris perlu pengecekan
            </span>
          ) : (
            "Semua baris terverifikasi baik"
          )}
        </p>
      </div>
    </div>
  );
}
