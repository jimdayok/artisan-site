"use client";

import { useEffect, useState } from "react";
import type { NewsletterNavArticle } from "./NewsletterArticleCard";

type NewsletterNavigationProps = {
  articles: NewsletterNavArticle[];
};

export default function NewsletterNavigation({ articles }: NewsletterNavigationProps) {
  const [activeId, setActiveId] = useState(articles[0]?.id ?? "");

  useEffect(() => {
    const updateActiveSection = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section[id]"),
      ).filter((section) =>
        articles.some((article) => article.id === section.id),
      );
      let current = sections[0]?.id ?? "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute("id") ?? current;
        }
      });

      setActiveId(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [articles]);

  return (
    <nav
      className="issue-nav"
      aria-label="In this issue"
    >
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
        In This Issue
      </p>
      {articles.map((article) => (
        <a
          key={article.id}
          href={`#${article.id}`}
          className={activeId === article.id ? "active" : undefined}
        >
          {article.label}
        </a>
      ))}
    </nav>
  );
}
