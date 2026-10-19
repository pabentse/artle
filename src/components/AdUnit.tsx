import { useEffect, useRef, useState } from "react";
import { advertisingEnabled } from "../domain/advertising";

declare global {
  interface Window {
    adsbygoogle?: { push: (ad: Record<string, unknown>) => void };
  }
}

let scriptPromise: Promise<void> | undefined;

function loadAdSense() {
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5334366314528443";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("AdSense unavailable"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/** Mounted only below the completed third round. No Google requests while disabled. */
export function AdUnit() {
  return advertisingEnabled() ? <CompletedGameAd /> : null;
}

function CompletedGameAd() {
  const container = useRef<HTMLElement>(null);
  const unit = useRef<HTMLModElement>(null);
  const requested = useRef(false);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (
        entry.isIntersecting &&
        window.innerWidth >= 360 &&
        element.clientWidth >= 320
      ) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !unit.current) return;
    let cancelled = false;
    const element = unit.current;
    const observer = new MutationObserver(() => {
      if (element.dataset.adStatus === "unfilled") setFailed(true);
    });
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });
    loadAdSense()
      .then(() => {
        if (cancelled || requested.current) return;
        requested.current = true;
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [visible]);

  if (failed) return null;
  return (
    <aside
      ref={container}
      className="completed-game-ad"
      aria-label="Advertisement"
    >
      {visible && (
        <>
          <span className="completed-game-ad__label">Advertisement</span>
          <ins
            ref={unit}
            className="adsbygoogle"
            style={{ display: "inline-block", width: 320, height: 50 }}
            data-ad-client="ca-pub-5334366314528443"
            data-ad-slot="3589348108"
          />
        </>
      )}
    </aside>
  );
}
