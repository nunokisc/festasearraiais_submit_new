"use client";

import Link from "next/link";
import Image from "next/image";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://festasearraiais.pt";

export function Navbar() {
  return (
    <header className="navbar-sticky bg-[#2d373c] text-white" role="banner">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href={MAIN_SITE}
            aria-label="Festas & Arraiais — página inicial"
            className="flex items-center gap-3 select-none shrink-0"
          >
            <Image
              src="https://cdn.festasearraiais.pt/festas-e-arraiais-logo-grey.png"
              alt="Festas & Arraiais"
              width={200}
              height={78}
              priority
              className="h-12 sm:h-14 w-auto"
              unoptimized
            />
          </Link>

          {/* Back to site link */}
          <Link
            href={MAIN_SITE}
            className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao site
          </Link>
        </div>
      </div>
    </header>
  );
}
