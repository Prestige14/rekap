"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { UploadZone } from "@/components/UploadZone";
import { QueueProgress } from "@/components/QueueProgress";
import { StatsCards } from "@/components/StatsCards";
import { SpreadsheetTable } from "@/components/SpreadsheetTable";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { ActionBar } from "@/components/ActionBar";
import { DocumentItem, ExtractedData } from "@/types/rekap";
import { generateId } from "@/lib/utils";

const SAMPLE_DATA: DocumentItem[] = [
  {
    id: "sample_doc_01",
    fileName: "INV-2026-0091_PT_Sumber_Makmur.pdf",
    fileSize: 245000,
    fileType: "application/pdf",
    status: "success",
    confidence: "high",
    createdAt: Date.now() - 3600000,
    extractedData: {
      invoiceNumber: "INV-2026-0091",
      vendorName: "PT Sumber Makmur Abadi",
      issueDate: "2026-10-15",
      dueDate: "2026-10-30",
      category: "Operasional",
      currency: "IDR",
      subtotal: 1500000,
      tax: 165000,
      totalAmount: 1665000,
      notes: "Pembelian perlengkapan kantor & ATK Q4",
    },
  },
  {
    id: "sample_doc_02",
    fileName: "Nota_SPBU_Pertamina_Solar.jpg",
    fileSize: 182000,
    fileType: "image/jpeg",
    status: "success",
    confidence: "high",
    createdAt: Date.now() - 3500000,
    extractedData: {
      invoiceNumber: "SPBU-34-10201",
      vendorName: "SPBU Pertamina 34-10201",
      issueDate: "2026-10-16",
      dueDate: "",
      category: "Logistik",
      currency: "IDR",
      subtotal: 450000,
      tax: 0,
      totalAmount: 450000,
      notes: "Pengisian BBM operasional armada pengiriman",
    },
  },
  {
    id: "sample_doc_03",
    fileName: "Kuitansi_Konsumsi_Rapat.png",
    fileSize: 310000,
    fileType: "image/png",
    status: "success",
    confidence: "medium",
    createdAt: Date.now() - 3400000,
    extractedData: {
      invoiceNumber: "KW-88219",
      vendorName: "RM Sederhana Minang",
      issueDate: "2026-10-14",
      dueDate: "",
      category: "Konsumsi",
      currency: "IDR",
      subtotal: 620000,
      tax: 62000,
      totalAmount: 682000,
      notes: "Konsumsi makan siang rapat koordinasi klien",
    },
  },
];

export default function RekapApp() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<DocumentItem | null>(null);

  // API Key settings stored in localStorage
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem("rekap_gemini_key");
      const storedModel = localStorage.getItem("rekap_gemini_model");
      if (storedKey) setApiKey(storedKey);
      if (storedModel) setSelectedModel(storedModel);
    } catch {
      // ignore localStorage errors in restricted environments
    }
  }, []);

  const handleSaveSettings = (newKey: string, newModel: string) => {
    setApiKey(newKey);
    setSelectedModel(newModel);
    try {
      if (newKey) {
        localStorage.setItem("rekap_gemini_key", newKey);
      } else {
        localStorage.removeItem("rekap_gemini_key");
      }
      localStorage.setItem("rekap_gemini_model", newModel);
    } catch {
      // ignore
    }
  };

  const handleLoadSampleData = () => {
    setItems((prev) => [...SAMPLE_DATA, ...prev]);
  };

  // Convert File to base64 DataURL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (item: DocumentItem, dataUrl: string): Promise<DocumentItem> => {
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-key": apiKey } : {}),
        },
        body: JSON.stringify({
          fileData: dataUrl,
          mimeType: item.fileType,
          fileName: item.fileName,
          apiKey: apiKey || undefined,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      return {
        ...item,
        status: "success",
        confidence: result.confidence || "high",
        extractedData: result.extractedData,
      };
    } catch (error) {
      console.error(`Error extracting ${item.fileName}:`, error);
      return {
        ...item,
        status: "failed",
        confidence: "low",
        errorMessage: error instanceof Error ? error.message : "Gagal mengekstrak data",
      };
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    // 1. Create queued document items
    const newItems: { item: DocumentItem; file: File; dataUrl: string }[] = [];

    for (const file of files) {
      const dataUrl = await readFileAsDataUrl(file);
      const docItem: DocumentItem = {
        id: generateId("doc"),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/pdf",
        fileDataUrl: dataUrl,
        status: "queued",
        confidence: "high",
        createdAt: Date.now(),
        extractedData: {
          invoiceNumber: "",
          vendorName: "",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: "",
          category: "Operasional",
          currency: "IDR",
          subtotal: 0,
          tax: 0,
          totalAmount: 0,
          notes: "",
        },
      };
      newItems.push({ item: docItem, file, dataUrl });
    }

    setItems((prev) => [...newItems.map((n) => n.item), ...prev]);
    setIsProcessing(true);

    // 2. Process sequentially to avoid API rate-limits and show clear progress
    for (const { item, dataUrl } of newItems) {
      // Mark as processing
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "processing" } : i))
      );

      const processed = await processFile(item, dataUrl);

      // Update with extracted data
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? processed : i))
      );
    }

    setIsProcessing(false);
  };

  const handleUpdateItem = useCallback(
    (id: string, updatedData: Partial<ExtractedData>) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextExtracted = { ...item.extractedData, ...updatedData };
            return {
              ...item,
              extractedData: nextExtracted,
            };
          }
          return item;
        })
      );
    },
    []
  );

  const handleDeleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleAddNewRow = () => {
    const today = new Date().toISOString().split("T")[0];
    const newRow: DocumentItem = {
      id: generateId("manual"),
      fileName: `Manual_Entry_${Date.now().toString().slice(-4)}`,
      fileSize: 0,
      fileType: "text/plain",
      status: "success",
      confidence: "high",
      createdAt: Date.now(),
      extractedData: {
        invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
        vendorName: "Vendor Baru",
        issueDate: today,
        dueDate: "",
        category: "Operasional",
        currency: "IDR",
        subtotal: 0,
        tax: 0,
        totalAmount: 0,
        notes: "Input manual",
      },
    };
    setItems((prev) => [newRow, ...prev]);
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (window.confirm("Apakah Anda yakin ingin menghapus semua baris data rekap?")) {
      setItems([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={Boolean(apiKey)}
        selectedModel={selectedModel}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Hero Section */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Ekstraksi Otomatis Dokumen ke Excel
          </h2>
          <p className="text-sm text-slate-600">
            Unggah berkas invoice PDF, kwitansi, atau foto struk pengeluaran. AI akan
            mengekstrak data terstruktur ke tabel interaktif siap unduh dalam format{" "}
            <span className="font-semibold text-emerald-700">.xlsx</span> atau{" "}
            <span className="font-semibold text-slate-800">.csv</span>.
          </p>
        </div>

        {/* F1: Drag & Drop Upload Zone */}
        <section aria-label="Upload Zone">
          <UploadZone
            onFilesSelected={handleFilesSelected}
            onLoadSampleData={items.length === 0 ? handleLoadSampleData : undefined}
            isProcessing={isProcessing}
          />
        </section>

        {/* State 2: Queue & Progress indicator */}
        <section aria-label="Processing Queue">
          <QueueProgress items={items} isProcessing={isProcessing} />
        </section>

        {/* Overview Stats Cards */}
        <section aria-label="Statistics Overview">
          <StatsCards items={items} />
        </section>

        {/* State 3: Interactive Review Spreadsheet Table */}
        <section aria-label="Review Table">
          <SpreadsheetTable
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddNewRow={handleAddNewRow}
            onPreviewItem={(item) => setPreviewItem(item)}
          />
        </section>

        {/* State 4: 1-Click Export Action Bar */}
        <ActionBar items={items} onClearAll={handleClearAll} />
      </main>

      {/* Modal: Document Visual Preview */}
      <DocumentPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Modal: API Settings */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        model={selectedModel}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
