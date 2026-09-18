"use client";

import { FormEvent, useState } from "react";
import { ArrowUp, Database, Sparkles } from "lucide-react";
import { artisanControlClass } from "@/app/components/controlStyles";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterQuestions = [
  "What customers are down?",
  "Is Eyes of Cimarron sending work?",
  "Who has not sent work in the last 7 days?",
];

function messageId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export default function AskArtisanDataChat({ dataThrough }: { dataThrough: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function ask(question: string) {
    const content = question.trim();
    if (!content || pending) return;

    const userMessage: ChatMessage = { id: messageId(), role: "user", content };
    const nextMessages = [...messages, userMessage].slice(-8);
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/portal/admin/data-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });
      const result = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !result.answer) {
        throw new Error(result.error || "The data assistant could not answer.");
      }
      setMessages((current) => [
        ...current,
        { id: messageId(), role: "assistant", content: result.answer! },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The data assistant could not answer.");
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(draft);
  }

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="overflow-hidden rounded-2xl border border-[#d8c49b] bg-[#fffaf1] shadow-[0_24px_80px_rgba(23,42,40,0.1)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#e4d5b8] bg-[#172a28] px-5 py-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d8c49b] text-[#172a28]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold">Ask Artisan Data</h2>
              <p className="text-xs text-white/70">Report snapshot through {dataThrough || "the latest refresh"}</p>
            </div>
          </div>
          <Database className="h-5 w-5 text-[#d8c49b]" aria-hidden="true" />
        </div>

        <div className="min-h-[28rem] space-y-5 px-5 py-6 sm:px-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-[#d8c49b] bg-white text-[#172a28]">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">What do you want to know?</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#706759]">
                Ask about customer activity, declining volume, or the latest shipment in the current reporting snapshot.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {starterQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className={artisanControlClass({ tone: "secondary", size: "sm" })}
                    onClick={() => void ask(question)}
                    disabled={pending}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-[#172a28] px-4 py-3 text-sm leading-6 text-white"
                    : "max-w-3xl whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-[#e4d5b8] bg-white px-4 py-3 text-sm leading-6 text-[#302d28]"
                }
              >
                {message.content}
              </article>
            ))
          )}
          {pending ? (
            <div className="max-w-xs rounded-2xl rounded-bl-sm border border-[#e4d5b8] bg-white px-4 py-3 text-sm text-[#706759]">
              Checking the report data…
            </div>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-[#c77b6b] bg-[#fff4f0] px-4 py-3 text-sm text-[#7a2f23]" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <form onSubmit={submit} className="border-t border-[#e4d5b8] bg-white/70 p-4 sm:p-5">
          <label htmlFor="artisan-data-question" className="sr-only">Ask a question about Artisan report data</label>
          <div className="flex items-end gap-3 rounded-2xl border border-[#d8c49b] bg-white p-2 focus-within:border-[#172a28]">
            <textarea
              id="artisan-data-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about a customer or activity trend…"
              rows={2}
              maxLength={1_000}
              className="min-h-14 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-[#172a28] outline-none placeholder:text-[#9a907f]"
              disabled={pending}
            />
            <button
              type="submit"
              className={artisanControlClass({ tone: "primary", size: "sm", className: "h-11 w-11 px-0" })}
              disabled={pending || !draft.trim()}
              aria-label="Send question"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 px-2 text-xs text-[#8b8172]">
            Answers use the reporting snapshot, not live lab traffic. Confirm important decisions in the source report.
          </p>
        </form>
      </div>

      <aside className="h-fit rounded-2xl border border-[#d8c49b] bg-[#fffaf1]/85 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">How answers work</p>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">Built for operational questions</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-[#706759]">
          <li>“Down” compares current jobs per day with the previous month.</li>
          <li>“Sending” checks current jobs and the latest shipment date.</li>
          <li>Every answer should include the report’s data-through date.</li>
          <li>Contact details and patient-level data are excluded.</li>
        </ul>
      </aside>
    </section>
  );
}
