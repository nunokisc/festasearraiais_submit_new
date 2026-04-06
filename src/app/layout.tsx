import type { Metadata } from "next";
import { Barlow, Raleway } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

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
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {/* AdSense init */}
        <Script
          id="adsbygoogle-init"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? "ca-pub-1083709580213704"}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* reCAPTCHA v3 */}
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <Script
            id="recaptcha-v3"
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
            strategy="afterInteractive"
          />
        )}
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
