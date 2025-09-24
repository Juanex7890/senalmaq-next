"use client";

import { useState } from "react";
import HSlider from "@/components/HSlider";
import { STORE } from "@/lib/store";

export interface ShortsRowProps {
  social?: {
    shorts?: string[];
    youtube?: string | null;
  } | null;
}

const normalizeShorts = (values: string[] | undefined | null): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
};

export function ShortsRow({ social }: ShortsRowProps) {
  const [interactiveId, setInteractiveId] = useState<string | null>(null);

  const shorts = (() => {
    const remoteShorts = normalizeShorts(social?.shorts);
    if (remoteShorts.length > 0) {
      return remoteShorts;
    }
    return normalizeShorts(STORE.social.shorts);
  })();

  if (shorts.length === 0) {
    return null;
  }

  const youtubeLink = (social?.youtube ?? STORE.social.youtube ?? "").trim();

  return (
    <section className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between mb-2">
        <h3 className="text-lg font-extrabold text-green-800">Shorts</h3>
        {youtubeLink && (
          <a
            href={youtubeLink}
            target="_blank"
            rel="noreferrer"
            className="text-green-700 text-sm hover:underline"
          >
            Ver canal +
          </a>
        )}
      </div>

      <HSlider step={320}>
        {shorts.map((videoId) => {
          const resolvedId = videoId.trim();
          if (!resolvedId) {
            return null;
          }

          const isInteractive = interactiveId === resolvedId;

          return (
            <div
              key={resolvedId}
              className="min-w-[240px] max-w-[260px] snap-start bg-white rounded-2xl shadow border border-green-100 p-2"
            >
              <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-[9/16]">
                <iframe
                  src={`https://www.youtube.com/embed/${resolvedId}?rel=0&modestbranding=1&playsinline=1`}
                  className={`absolute inset-0 w-full h-full ${isInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
                  title={`Short ${resolvedId}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                {!isInteractive && (
                  <button
                    type="button"
                    onClick={() => setInteractiveId(resolvedId)}
                    className="absolute inset-0 grid place-content-center text-white/95 text-sm font-semibold bg-black/30"
                  >
                    Toca para reproducir
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </HSlider>
    </section>
  );
}

export default ShortsRow;
