"use client";

import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, Sparkles, FolderUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSampleData?: () => void;
  isProcessing: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = ".pdf,.png,.jpg,.jpeg,.webp";

export function UploadZone({
  onFilesSelected,
  onLoadSampleData,
  isProcessing,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterAndEmitFiles = (incomingFiles: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];

    Array.from(incomingFiles).forEach((file) => {
      const isTypeValid =
        ACCEPTED_TYPES.includes(file.type) ||
        /\.(pdf|png|jpe?g|webp)$/i.test(file.name);

      if (isTypeValid) {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      setErrorMsg("Format berkas tidak didukung. Harap unggah PDF, PNG, JPG, atau WEBP.");
      return;
    }

    if (validFiles.length > 30) {
      setErrorMsg("Maksimal 30 berkas per batch untuk menjaga performa.");
      onFilesSelected(validFiles.slice(0, 30));
    } else {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      filterAndEmitFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      filterAndEmitFiles(e.target.files);
    }
    // reset input so re-selecting same files triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-blue-500 bg-blue-50/70 scale-[1.005] shadow-lg shadow-blue-500/10"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 shadow-sm",
          isProcessing && "opacity-60 cursor-not-allowed pointer-events-none"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20 mb-4">
          <UploadCloud className="h-8 w-8 stroke-[2.2]" />
        </div>

        <h3 className="text-base font-semibold text-slate-800">
          Tarik dan lepas berkas invoice atau struk di sini
        </h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md">
          Mendukung PDF, PNG, JPG, JPEG, WEBP hingga 20+ dokumen sekaligus untuk ekstraksi instan.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
          >
            <FolderUp className="h-4 w-4" />
            <span>Pilih Berkas dari Komputer</span>
          </button>

          {onLoadSampleData && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLoadSampleData();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Muat Contoh Data Cepat</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
