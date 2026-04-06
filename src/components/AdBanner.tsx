"use client";

// Identical to festasearraiais_website_new — AdBanner component
import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical";
  className?: string;
}

const CLIENT = "ca-pub-1083709580213704";

export function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    if (!insRef.current) return;
    try {
      pushed.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle.push({});
    } catch {
      // adsbygoogle not loaded yet (dev / adblock)
    }
  }, []);

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={insRef as any}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
