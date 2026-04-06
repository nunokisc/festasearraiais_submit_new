import type { Metadata } from "next";
import { Barlow, Raleway } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://adicionar.festasearraiais.pt"
  ),
  icons: {
    icon: "https://festasearraiais.pt/favicon.png",
  },
  title: "Festas & Arraiais — Submeter Evento",
  description:
    "Submete um evento para o Festas & Arraiais. Preenche os dados da tua festa, arraial ou evento tradicional.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://adicionar.festasearraiais.pt",
    siteName: "Festas & Arraiais",
    title: "Festas & Arraiais — Submeter Evento",
    description:
      "Submete um evento para o Festas & Arraiais.",
    images: [
      {
        url: "https://cdn.festasearraiais.pt/festas-e-arraiais-logo-black-banner.png",
        alt: "Festas & Arraiais",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body
        className={`${barlow.variable} ${raleway.variable} min-h-screen flex flex-col`}
        style={{ fontFamily: "var(--font-primary)" }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
