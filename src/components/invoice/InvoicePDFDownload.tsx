"use client";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";
import { InvoiceWithItems, Profile } from "@/lib/types";

type InvoiceWithClient = InvoiceWithItems & {
  clients: { id: string; name: string; phone: string | null; address: string | null } | null;
};

export default function InvoicePDFDownload({
  invoice,
  profile,
  fullWidth,
}: {
  invoice: InvoiceWithClient;
  profile: Profile;
  fullWidth?: boolean;
}) {
  const [generating, setGenerating] = useState(false);

  async function downloadPDF() {
    setGenerating(true);
    try {
      const blob = await pdf(
        <InvoicePDF invoice={invoice} profile={profile} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
    setGenerating(false);
  }

  return (
    <button
      onClick={downloadPDF}
      disabled={generating}
      className={`${
        fullWidth ? "w-full" : ""
      } bg-[#00875A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:brightness-105 transition disabled:opacity-50 flex items-center justify-center gap-1.5`}
    >
      📄 {generating ? "Generating…" : "Download PDF"}
    </button>
  );
}
