import { useEffect } from "react";

/** Preserve old hash links; the canonical policy is readable without JavaScript. */
export function PrivacyPage() {
  useEffect(() => {
    window.location.replace("/privacy.html");
  }, []);
  return (
    <main className="px-4 py-6">
      <a className="underline" href="/privacy.html">
        Read Artle’s privacy policy
      </a>
    </main>
  );
}
