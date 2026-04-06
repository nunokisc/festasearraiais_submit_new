import Link from "next/link";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://festasearraiais.pt";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1a2327] text-gray-400 mt-auto" role="contentinfo">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
          {/* Social links */}
          <nav aria-label="Redes sociais" className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/festasearraiais"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/festasearraiais/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://t.me/festasearraiais"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="hover:text-white transition-colors"
            >
              Telegram
            </a>
          </nav>

          {/* Info links */}
          <nav aria-label="Informações" className="flex items-center gap-4">
            <Link href={`${MAIN_SITE}/privacidade`} className="hover:text-white transition-colors">
              Privacidade
            </Link>
            <Link href={`${MAIN_SITE}/contacto`} className="hover:text-white transition-colors">
              Contacto
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-gray-600">
          Copyright {year} &nbsp;
          <Link href={MAIN_SITE} className="text-gray-400 hover:text-white transition-colors">
            Festas &amp; Arraiais
          </Link>
          &nbsp;— Caso pretendas destacar o teu evento, contacta-nos em{" "}
          <a
            href="mailto:info@festasearraiais.pt"
            className="text-gray-400 hover:text-white transition-colors"
          >
            info@festasearraiais.pt
          </a>
        </div>
      </div>
    </footer>
  );
}
