import React from "react";

export function KvissBanner() {
  return (
    <div className="my-3 px-4 py-3 rounded-md border-2 border-emerald-600 bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-400 text-white text-center font-extrabold tracking-wide shadow-lg uppercase">
      <a
        href="https://kviss.eu"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 hover:scale-[1.02] transition-transform duration-200 w-full"
      >
        <span className="text-xs text-white/80 tracking-[0.3em]">EXTRA! EXTRA!</span>
        <span className="text-lg sm:text-xl">Try Kviss 🧠</span>
        <span className="text-xs text-white/90 normal-case">
          Tap for today&apos;s quiz →
        </span>
      </a>
    </div>
  );
}
