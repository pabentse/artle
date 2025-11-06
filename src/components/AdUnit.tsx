import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdUnit({ slot }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      // Ignore errors before AdSense approval
      console.debug("adsbygoogle push error", err);
    }
  }, []);

  return (
    <div ref={adRef} className="flex justify-center my-4">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5334366314528443"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

