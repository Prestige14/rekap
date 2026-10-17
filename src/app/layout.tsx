import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rekap — Automated Document & Invoice Extractor to Excel",
  description:
    "Ekstraksi otomatis PDF invoice, struk, dan bukti transaksi menjadi tabel spreadsheet Excel (.xlsx) dan CSV.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
