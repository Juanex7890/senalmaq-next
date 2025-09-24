"use client";

import { useEffect, useState } from "react";
import { mapSocialDocument, subscribeToSocial, SOCIAL_DEFAULTS, type SocialData } from "@/lib/firebase";
import { STORE } from "@/lib/store";

const FALLBACK_SOCIAL: SocialData = {
  instagram: STORE.social.instagram,
  youtube: STORE.social.youtube,
  tiktok: STORE.social.tiktok,
  videoId: STORE.social.videoId,
  shorts: [...STORE.social.shorts],
};

const sanitize = (value: string | null | undefined): string => (value ?? "").trim();

const mergeSocialData = (incoming: SocialData | null | undefined): SocialData => {
  const base = incoming ?? SOCIAL_DEFAULTS;
  const shorts = Array.isArray(base.shorts) && base.shorts.length > 0
    ? base.shorts.map((item) => sanitize(item)).filter(Boolean)
    : [...FALLBACK_SOCIAL.shorts];

  return {
    instagram: sanitize(base.instagram) || FALLBACK_SOCIAL.instagram,
    youtube: sanitize(base.youtube) || FALLBACK_SOCIAL.youtube,
    tiktok: sanitize(base.tiktok) || FALLBACK_SOCIAL.tiktok,
    videoId: sanitize(base.videoId) || FALLBACK_SOCIAL.videoId,
    shorts,
  };
};

interface UseSocialResult {
  social: SocialData;
  loading: boolean;
  error: string | null;
}

export function useSocial(): UseSocialResult {
  const [social, setSocial] = useState<SocialData>(() => mergeSocialData(FALLBACK_SOCIAL));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSocial(
      (snapshot) => {
        setSocial(mergeSocialData(mapSocialDocument(snapshot)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setSocial(mergeSocialData(null));
        setLoading(false);
        setError(err?.message ?? "No pudimos cargar la informacion social.");
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return { social, loading, error };
}
