export type DocumentStatus = "queued" | "processing" | "success" | "failed";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface ExtractedData {
  invoiceNumber: string;
  vendorName: string;
  issueDate: string;
  dueDate: string;
  category: string;
  currency: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  notes: string;
}

export interface DocumentItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileDataUrl?: string;
  status: DocumentStatus;
  confidence: ConfidenceLevel;
  errorMessage?: string;
  extractedData: ExtractedData;
  createdAt: number;
}

export interface ApiSettings {
  geminiApiKey: string;
  model: string;
}
