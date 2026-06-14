import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "হিসাব — Bangla Invoicing",
  description: "Professional invoicing for Bangladesh SMEs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
