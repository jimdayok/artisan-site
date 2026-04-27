"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type VideoGalleryCategory =
  | "Training"
  | "Equipment"
  | "Education"
  | "Industry"
  | "Product";

export type VideoGalleryItem = {
  id: string;
  title: string;
  category: VideoGalleryCategory;
  published?: string;
  description?: string;
};

type VideoGalleryProps = {
  eyebrow?: string;
  title?: string;
  subheadline?: string;
  videos: VideoGalleryItem[];
  channelUrl?: string;
};

const filterTabs: Array<"All" | VideoGalleryCategory> = [
  "All",
  "Training",
  "Equipment",
  "Industry",
  "Product",
  "Education",
];

export default function VideoGallery({
  eyebrow = "Training & Education",
  title = "Insights and Training",
  subheadline = "Real education. Real tools. Built for independent practices.",
  videos,
  channelUrl = "https://www.youtube.com/@ArtisanLabNtwk",
}: VideoGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<(typeof filterTabs)[number]>("All");
  const [activeVideo, setActiveVideo] = useState<VideoGalleryItem | null>(null);

  const visibleVideos = useMemo(() => {
    if (activeFilter === "All") return videos;
    return videos.filter((video) => video.category === activeFilter);
  }, [activeFilter, videos]);

  useEffect(() => {
    if (!activeVideo) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveVideo(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideo]);

  return (
    <section id="training-education" data-theme="light" className="bg-[#f5f1eb] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
        >
          <div>
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {title}
            </h2>
          </div>
          <p className="max-w-3xl text-lg leading-8 text-[#625b53] md:text-[1.15rem]">
            {subheadline}
          </p>
        </motion.div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeFilter === tab
                  ? "border-[#1f1a17] bg-[#1f1a17] text-white shadow-[0_12px_28px_rgba(24,18,13,0.18)]"
                  : "border-black/10 bg-white/70 text-[#625b53] hover:border-[#d4c09a] hover:bg-white hover:text-[#1f1a17]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
          className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {visibleVideos.map((video) => (
            <motion.button
              key={video.id}
              type="button"
              onClick={() => setActiveVideo(video)}
              variants={{
                hidden: { opacity: 0, y: 22 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="group overflow-hidden rounded-[28px] border border-black/10 bg-white text-left shadow-[0_18px_48px_rgba(24,18,13,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(24,18,13,0.14)]"
            >
              <div className="relative aspect-video overflow-hidden bg-[#211b17]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/8 to-transparent" />
                <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/90 text-[#1f1a17] shadow-[0_14px_36px_rgba(0,0,0,0.28)] transition duration-300 group-hover:scale-110 group-hover:bg-[#d4c09a]">
                  <span className="ml-1 text-lg">▶</span>
                </span>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
                  <span>{video.category}</span>
                  {video.published ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-[#c9b28b]" />
                      <span>{video.published}</span>
                    </>
                  ) : null}
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-[#1f1a17]">
                  {video.title}
                </h3>
                {video.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#625b53]">
                    {video.description}
                  </p>
                ) : null}
              </div>
            </motion.button>
          ))}
        </motion.div>

        <div className="mt-10 flex justify-center">
          <a
            href={channelUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-[#d4c09a]"
          >
            View All Videos
          </a>
        </div>
      </div>

      <AnimatePresence>
        {activeVideo ? (
          <motion.div
            className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={activeVideo.title}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
            />
            <motion.div
              className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-[#171311] text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/45 text-xl leading-none text-white transition hover:bg-white hover:text-[#171311]"
                aria-label="Close video"
              >
                x
              </button>
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                  title={activeVideo.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-5 md:p-7">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4c09a]">
                  <span>{activeVideo.category}</span>
                  {activeVideo.published ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-[#d4c09a]" />
                      <span>{activeVideo.published}</span>
                    </>
                  ) : null}
                </div>
                <h3 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
                  {activeVideo.title}
                </h3>
                {activeVideo.description ? (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
                    {activeVideo.description}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
