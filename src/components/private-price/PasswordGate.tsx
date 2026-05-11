import type { ReactNode } from "react";

export default function PasswordGate({
  error,
  nextPath,
  action,
}: {
  error: boolean;
  nextPath: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <main className="min-h-screen bg-[#f4eee4] px-4 py-10 text-[#122033]">
      <div className="mx-auto max-w-lg rounded-3xl border border-[#dfd2bf] bg-white/92 p-6 shadow-[0_28px_80px_rgba(18,32,51,0.12)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Private Access</p>
        <h1 className="mt-4 text-3xl font-semibold">Artisan Lab Network Pricing Portal</h1>
        <p className="mt-3 text-sm leading-7 text-[#4d5664]">Enter the private price list password to continue.</p>
        {error ? <Notice>That password did not match.</Notice> : null}
        <form action={action} className="mt-6 grid gap-4">
          <input type="hidden" name="nextPath" value={nextPath} />
          <input name="password" type="password" autoComplete="current-password" className="min-h-12 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-4 outline-none focus:border-[#c7ad7b]" placeholder="Password" />
          <button className="min-h-12 rounded-full bg-[#122033] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#c7ad7b] hover:text-[#122033]">Unlock Pricing Portal</button>
        </form>
      </div>
    </main>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <p className="mt-4 rounded-2xl border border-[#e4b7a8] bg-[#fff2ed] px-4 py-3 text-sm font-semibold text-[#8a3f22]">{children}</p>;
}
