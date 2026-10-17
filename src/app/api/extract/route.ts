import { NextRequest, NextResponse } from "next/server";
import { extractDocumentData } from "@/lib/gemini";

export const maxDuration = 60; // Allow sufficient time for multimodal AI processing

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let base64Data = "";
    let mimeType = "";
    let fileName = "document";
    let apiKey = req.headers.get("x-gemini-key") || undefined;
    let model = "gemini-2.5-flash";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      base64Data = body.fileData || "";
      mimeType = body.mimeType || "application/pdf";
      fileName = body.fileName || "document";
      if (body.apiKey) apiKey = body.apiKey;
      if (body.model) model = body.model;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "File tidak ditemukan dalam form data" }, { status: 400 });
      }
      fileName = file.name;
      mimeType = file.type || "application/pdf";
      const customKey = formData.get("apiKey") as string | null;
      if (customKey) apiKey = customKey;
      const customModel = formData.get("model") as string | null;
      if (customModel) model = customModel;

      const arrayBuffer = await file.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString("base64");
    } else {
      return NextResponse.json(
        { error: "Content-Type tidak didukung. Gunakan application/json atau multipart/form-data" },
        { status: 400 }
      );
    }

    if (!base64Data) {
      return NextResponse.json({ error: "Data berkas kosong" }, { status: 400 });
    }

    const result = await extractDocumentData(base64Data, mimeType, fileName, apiKey, model);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API /api/extract error:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan internal saat memproses berkas.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
