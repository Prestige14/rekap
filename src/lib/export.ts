import ExcelJS from "exceljs";
import { DocumentItem } from "@/types/rekap";

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function exportToExcel(
  items: DocumentItem[],
  customFileName?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Rekap";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Rekap Invoice & Dokumen", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  worksheet.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Nama Berkas", key: "fileName", width: 28 },
    { header: "Nomor Invoice / Bukti", key: "invoiceNumber", width: 22 },
    { header: "Vendor / Pihak Terbit", key: "vendorName", width: 28 },
    { header: "Tanggal", key: "issueDate", width: 14 },
    { header: "Jatuh Tempo", key: "dueDate", width: 14 },
    { header: "Kategori", key: "category", width: 18 },
    { header: "Mata Uang", key: "currency", width: 10 },
    { header: "Subtotal", key: "subtotal", width: 18 },
    { header: "Pajak (PPN)", key: "tax", width: 16 },
    { header: "Total Nominal", key: "totalAmount", width: 20 },
    { header: "Catatan", key: "notes", width: 30 },
    { header: "Status Verifikasi", key: "confidence", width: 18 },
  ];

  // Header row styling
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }, // slate-900
  };

  // Populate data rows
  items.forEach((item, index) => {
    const row = worksheet.addRow({
      no: index + 1,
      fileName: item.fileName,
      invoiceNumber: item.extractedData.invoiceNumber || "-",
      vendorName: item.extractedData.vendorName || "-",
      issueDate: item.extractedData.issueDate || "-",
      dueDate: item.extractedData.dueDate || "-",
      category: item.extractedData.category || "Umum",
      currency: item.extractedData.currency || "IDR",
      subtotal: item.extractedData.subtotal || 0,
      tax: item.extractedData.tax || 0,
      totalAmount: item.extractedData.totalAmount || 0,
      notes: item.extractedData.notes || "",
      confidence:
        item.confidence === "high"
          ? "Akurat (High)"
          : item.confidence === "medium"
          ? "Sedang (Med)"
          : "Perlu Cek (Low)",
    });

    row.height = 22;
    row.alignment = { vertical: "middle" };

    // Currency formatting
    row.getCell("subtotal").numFmt = '"Rp"#,##0;[Red]("-Rp"#,##0);"-"';
    row.getCell("tax").numFmt = '"Rp"#,##0;[Red]("-Rp"#,##0);"-"';
    row.getCell("totalAmount").numFmt = '"Rp"#,##0;[Red]("-Rp"#,##0);"-"';

    // Borders & zebra background
    const isEven = index % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
  });

  // Automated Formula Row for Total (F4 specification)
  if (items.length > 0) {
    const lastDataRowIndex = items.length + 1;
    const summaryRow = worksheet.addRow({
      no: "",
      fileName: "",
      invoiceNumber: "",
      vendorName: "",
      issueDate: "",
      dueDate: "",
      category: "",
      currency: "TOTAL",
      subtotal: { formula: `SUM(I2:I${lastDataRowIndex})` },
      tax: { formula: `SUM(J2:J${lastDataRowIndex})` },
      totalAmount: { formula: `SUM(K2:K${lastDataRowIndex})` },
      notes: `${items.length} Berkas diproses`,
      confidence: "",
    });

    summaryRow.height = 26;
    summaryRow.font = { name: "Segoe UI", size: 10, bold: true };
    summaryRow.alignment = { vertical: "middle" };
    summaryRow.getCell("currency").alignment = { vertical: "middle", horizontal: "center" };
    summaryRow.getCell("subtotal").numFmt = '"Rp"#,##0;[Red]("-Rp"#,##0);"-"';
    summaryRow.getCell("tax").numFmt = '"Rp"#,##0;[Red]("-Rp"#,##0);"-"';
    summaryRow.getCell("totalAmount").numFmt = '"Rp"#,##0;[Red]("-Rp"#,##0);"-"';

    summaryRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FF94A3B8" } },
        bottom: { style: "double", color: { argb: "FF0F172A" } },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF1F5F9" },
      };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, customFileName || `Rekap_Dokumen_${getTimestamp()}.xlsx`);
}

export function exportToCsv(
  items: DocumentItem[],
  customFileName?: string
): void {
  const headers = [
    "No",
    "Nama Berkas",
    "Nomor Invoice",
    "Vendor / Pihak Terbit",
    "Tanggal",
    "Jatuh Tempo",
    "Kategori",
    "Mata Uang",
    "Subtotal",
    "Pajak",
    "Total Nominal",
    "Catatan",
    "Status Verifikasi",
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    const s = String(val ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = items.map((item, idx) =>
    [
      idx + 1,
      escapeCsv(item.fileName),
      escapeCsv(item.extractedData.invoiceNumber),
      escapeCsv(item.extractedData.vendorName),
      escapeCsv(item.extractedData.issueDate),
      escapeCsv(item.extractedData.dueDate),
      escapeCsv(item.extractedData.category),
      escapeCsv(item.extractedData.currency),
      item.extractedData.subtotal ?? 0,
      item.extractedData.tax ?? 0,
      item.extractedData.totalAmount ?? 0,
      escapeCsv(item.extractedData.notes),
      escapeCsv(item.confidence),
    ].join(",")
  );

  // UTF-8 BOM for Microsoft Excel auto-encoding
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, customFileName || `Rekap_Dokumen_${getTimestamp()}.csv`);
}
