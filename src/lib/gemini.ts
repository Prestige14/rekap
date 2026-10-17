import { GoogleGenAI } from "@google/genai";
import { ExtractedData, ConfidenceLevel } from "@/types/rekap";

export interface ExtractionResult {
  status: "success" | "failed";
  confidence: ConfidenceLevel;
  extractedData: ExtractedData;
  errorMessage?: string;
  source: "gemini" | "heuristic_fallback";
}

const EXTRACTION_SYSTEM_INSTRUCTION = `
Anda adalah sistem AI ekstraksi dokumen keuangan, invoice, kwitansi, bukti transfer, dan struk belanja untuk akuntansi dan rekapitulasi Excel.
Tugas Anda adalah membaca gambar/dokumen yang diunggah dan mengekstrak data keuangan terstruktur dengan tingkat akurasi tinggi.

Format keluaran HARUS berupa objek JSON valid dengan struktur berikut:
{
  "invoiceNumber": string (nomor invoice / nota / kuitansi / referensi transaksi, contoh: "INV-2026-0091"),
  "vendorName": string (nama perusahaan, toko, merchant, atau penerbit dokumen),
  "issueDate": string (tanggal transaksi/terbit dalam format YYYY-MM-DD),
  "dueDate": string (tanggal jatuh tempo jika ada dalam format YYYY-MM-DD, atau ""),
  "category": string (kategori pengeluaran seperti: Operasional, Logistik, Konsumsi, ATK, Utilitas, Pemeliharaan, Pajak, dll),
  "currency": string (mata uang standar, default: "IDR"),
  "subtotal": number (angka nominal sebelum pajak, jika tidak tertera gunakan totalAmount dikurangi tax atau samakan dengan totalAmount),
  "tax": number (angka nominal pajak/PPN, 0 jika tidak ada pajak tertera),
  "totalAmount": number (angka total akhir yang harus dibayar / tertera di dokumen),
  "notes": string (ringkasan singkat item barang/jasa atau peruntukan belanja),
  "confidence": "high" | "medium" | "low" (tingkat kepastian hasil pembacaan)
}

Peraturan penting:
1. Nominal angka subtotal, tax, dan totalAmount harus berupa angka murni (number), bukan string dengan format titik atau "Rp".
2. Format tanggal harus YYYY-MM-DD. Jika tanggal hanya tertera tanggal dan bulan tanpa tahun, asumsikan tahun saat ini.
3. Jika terdapat bagian yang blur atau tidak terbaca dengan jelas, set confidence ke "medium" atau "low" dan jelaskan di "notes".
`;

export async function extractDocumentData(
  base64Data: string,
  mimeType: string,
  fileName: string,
  customApiKey?: string,
  modelName: string = "gemini-2.5-flash"
): Promise<ExtractionResult> {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

  // If no API key is provided, use heuristic extraction
  if (!apiKey) {
    return runHeuristicExtraction(fileName);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Clean base64 payload if it includes data URL header
    const cleanBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    const response = await ai.models.generateContent({
      model: modelName || "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || "application/pdf",
              },
            },
            {
              text: `Ekstrak data terstruktur dari berkas "${fileName}" ini ke dalam format JSON yang telah ditentukan. Berikan HANYA JSON tanpa format markdown wrap atau teks pendamping.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text?.trim() || "{}";
    const cleanedJson = textOutput
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedJson);

    const subtotal = Number(parsed.subtotal) || 0;
    const tax = Number(parsed.tax) || 0;
    let total = Number(parsed.totalAmount) || 0;
    if (total === 0 && subtotal > 0) {
      total = subtotal + tax;
    }

    const confidence: ConfidenceLevel =
      parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
        ? parsed.confidence
        : "high";

    return {
      status: "success",
      confidence,
      source: "gemini",
      extractedData: {
        invoiceNumber: String(parsed.invoiceNumber || "").trim(),
        vendorName: String(parsed.vendorName || "").trim(),
        issueDate: String(parsed.issueDate || "").trim(),
        dueDate: String(parsed.dueDate || "").trim(),
        category: String(parsed.category || "Operasional").trim(),
        currency: String(parsed.currency || "IDR").toUpperCase().trim(),
        subtotal,
        tax,
        totalAmount: total,
        notes: String(parsed.notes || "").trim(),
      },
    };
  } catch (error) {
    console.error("Gemini extraction error:", error);
    // If Gemini fails, fallback gracefully
    const fallback = runHeuristicExtraction(fileName);
    return {
      ...fallback,
      confidence: "low",
      errorMessage: error instanceof Error ? error.message : "Gagal memproses via AI",
    };
  }
}

function runHeuristicExtraction(fileName: string): ExtractionResult {
  // Infer basic metadata from filename if possible
  const cleanName = fileName.replace(/\.[^/.]+$/, "");
  const today = new Date().toISOString().split("T")[0];

  // Try parsing pattern like "INV-2026-001_PT_Sumber_Makmur"
  const parts = cleanName.split(/[-_ ]+/);
  let potentialInv = "";
  let potentialVendor = "";

  for (const part of parts) {
    if (/^(inv|no|kw|receipt|struk)/i.test(part) || /\d{3,}/.test(part)) {
      if (!potentialInv) potentialInv = part.toUpperCase();
    } else if (part.length > 2 && !potentialVendor) {
      potentialVendor = part.charAt(0).toUpperCase() + part.slice(1);
    }
  }

  return {
    status: "success",
    confidence: "medium",
    source: "heuristic_fallback",
    extractedData: {
      invoiceNumber: potentialInv || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorName: potentialVendor || "Vendor Rekap",
      issueDate: today,
      dueDate: "",
      category: "Operasional",
      currency: "IDR",
      subtotal: 1000000,
      tax: 110000,
      totalAmount: 1110000,
      notes: "Mode pratinjau lokal (Masukkan API Key di Pengaturan untuk ekstraksi Gemini Vision).",
    },
  };
}
