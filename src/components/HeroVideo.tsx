import { STORE } from "@/lib/store";

export interface HeroVideoProps {
  videoId?: string | null;
  title?: string;
}

export function HeroVideo({ videoId, title = "Video principal" }: HeroVideoProps) {
  const resolvedVideoId = (videoId ?? STORE.social.videoId ?? "").trim();

  if (!resolvedVideoId) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 pt-4">
      <div className="rounded-2xl overflow-hidden shadow border border-green-100">
        <div className="relative aspect-video bg-black w-full">
          <iframe
            src={`https://www.youtube.com/embed/${resolvedVideoId}?rel=0`}
            className="absolute inset-0 w-full h-full"
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export default HeroVideo;
