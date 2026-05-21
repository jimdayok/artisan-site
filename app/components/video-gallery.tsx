"use client";

import { motion } from "framer-motion";

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
  href?: string;
};

type VideoGalleryProps = {
  eyebrow?: string;
  title?: string;
  subheadline?: string;
  videos: VideoGalleryItem[];
};

export default function VideoGallery({
  eyebrow = "Training & Education",
  title = "Insights and Training",
  subheadline = "Real education. Real tools. Built for independent practices.",
  videos,
}: VideoGalleryProps) {
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

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
          className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {videos.map((video) => (
            <motion.a
              key={video.id}
              href={video.href ?? `https://youtu.be/${video.id}`}
              target="_blank"
              rel="noreferrer"
              variants={{
                hidden: { opacity: 0, y: 22 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="group flex h-full min-h-[390px] flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white text-left shadow-[0_18px_48px_rgba(24,18,13,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(24,18,13,0.14)]"
            >
              <div className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,#211b17_0%,#3b312a_48%,#d4c09a_160%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.22))]" />
                <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/90 text-[#1f1a17] shadow-[0_14px_36px_rgba(0,0,0,0.28)] transition duration-300 group-hover:scale-110 group-hover:bg-[#d4c09a]">
                  <span className="ml-1 text-lg">▶</span>
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
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
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#625b53]">
                    {video.description}
                  </p>
                ) : null}
              </div>
            </motion.a>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
