import { jsPDF } from "jspdf";
import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "invoices";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase service role key is required for invoice storage.");
  }

  return createClient(url, serviceKey);
}

export type InvoiceData = {
  invoiceNumber: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
};

export function generateInvoicePdf(data: InvoiceData): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // ── Header with brand ──
  doc.setFillColor(124, 58, 237); // violet-600
  doc.rect(0, 0, pageWidth, 45, "F");

  // Logo leaf shape (simplified)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.2);
  doc.line(margin + 2, 14, margin + 12, 30);
  doc.line(margin + 12, 30, margin + 22, 14);
  doc.line(margin + 12, 18, margin + 12, 30);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("verytis", margin + 28, 24);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Follow-up cockpit", margin + 28, 32);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, 24, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`#${data.invoiceNumber}`, pageWidth - margin, 32, { align: "right" });

  y = 60;

  // ── Invoice details ──
  doc.setTextColor(50, 34, 82); // #332252
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Date", margin, y);
  doc.text("Billing Period", margin + 70, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(data.date, margin, y);
  doc.text(`${data.periodStart} — ${data.periodEnd}`, margin + 70, y);

  y += 16;

  // ── Bill to ──
  doc.setTextColor(50, 34, 82);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(data.customerName, margin, y);
  y += 5;
  doc.text(data.customerEmail, margin, y);

  y += 16;

  // ── Table header ──
  doc.setFillColor(247, 245, 255); // violet-50
  doc.rect(margin, y, pageWidth - 2 * margin, 10, "F");

  doc.setTextColor(50, 34, 82);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin + 4, y + 7);
  doc.text("Qty", margin + 110, y + 7, { align: "center" });
  doc.text("Unit Price", margin + 135, y + 7, { align: "right" });
  doc.text("Amount", pageWidth - margin - 4, y + 7, { align: "right" });

  y += 14;

  // ── Line item ──
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Verytis Solo — Monthly subscription", margin + 4, y);
  doc.text("1", margin + 110, y, { align: "center" });
  doc.text(`$${data.amount.toFixed(2)}`, margin + 135, y, { align: "right" });
  doc.text(`$${data.amount.toFixed(2)}`, pageWidth - margin - 4, y, { align: "right" });

  y += 6;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);

  y += 12;

  // ── Total ──
  doc.setFillColor(124, 58, 237);
  doc.rect(pageWidth - margin - 60, y - 4, 60, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Total", pageWidth - margin - 56, y + 5);
  doc.text(`$${data.amount.toFixed(2)}`, pageWidth - margin - 4, y + 5, { align: "right" });

  y += 30;

  // ── Footer ──
  doc.setTextColor(160, 160, 160);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business.", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text("Verytis — verytis.com", pageWidth / 2, y, { align: "center" });

  return doc.output("arraybuffer") as unknown as Uint8Array;
}

export async function uploadInvoiceToSupabase(
  userId: string,
  pdfData: Uint8Array,
  invoiceId: string,
): Promise<string> {
  const supabase = getServiceClient();

  const filePath = `${userId}/${invoiceId}.pdf`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, pdfData, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload invoice: ${error.message}`);
  }

  return filePath;
}

export async function getInvoiceDownloadUrl(
  userId: string,
  invoiceId: string,
): Promise<string> {
  const supabase = getServiceClient();
  const filePath = `${userId}/${invoiceId}.pdf`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate download URL: ${error?.message ?? "Unknown error"}`);
  }

  return data.signedUrl;
}

export async function listUserInvoices(userId: string): Promise<{ id: string; name: string; createdAt: string }[]> {
  const supabase = getServiceClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(userId, { sortBy: { column: "created_at", order: "desc" } });

  if (error) {
    return [];
  }

  return (data ?? [])
    .filter((file) => file.name.endsWith(".pdf"))
    .map((file) => ({
      id: file.name.replace(".pdf", ""),
      name: file.name,
      createdAt: file.created_at ?? new Date().toISOString(),
    }));
}
