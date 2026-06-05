import Link from "next/link";

export const adminButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffaf1] px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-white";

export function AdminAccessRequired() {
  return (
    <main className="min-h-screen bg-[#f4efe6] px-5 py-12 text-[#172a28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl border border-[#d8c49b] bg-[#fffaf1]/88 p-8 shadow-[0_24px_80px_rgba(23,42,40,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b7650]">
          Admin Portal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
          Admin access required
        </h1>
        <p className="mt-4 text-base leading-7 text-[#706759]">
          This area is available only to approved Artisan Lab Network admins.
          Please sign in with an approved Cloudflare Access account.
        </p>
        <Link href="/portal" className={`${adminButtonClass} mt-7`}>
          Return to Customer Portal
        </Link>
      </div>
    </main>
  );
}

export function AdminShell({
  title,
  eyebrow = "ALN Admin Portal",
  adminEmail,
  children,
}: {
  title: string;
  eyebrow?: string;
  adminEmail: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f4efe6] px-5 py-10 text-[#172a28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-[#d8c49b] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8b7650]">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-[#706759]">
              Signed in as {adminEmail}
            </p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link href="/" className={adminButtonClass}>
              Back to Main Website
            </Link>
            <Link href="/portal/admin" className={adminButtonClass}>
              Admin Dashboard
            </Link>
            <Link href="/portal/admin/price-lists" className={adminButtonClass}>
              All Price Lists
            </Link>
            <Link href="/portal/admin/rewards" className={adminButtonClass}>
              Rewards Payouts
            </Link>
            <Link href="/portal/employee-resources" className={adminButtonClass}>
              Employee Resources
            </Link>
            <Link href="/portal" className={adminButtonClass}>
              Customer Portal
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </main>
  );
}

export function SearchBox({
  query,
  placeholder,
}: {
  query: string;
  placeholder: string;
}) {
  return (
    <form className="mt-8 flex flex-col gap-3 sm:flex-row">
      <input
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        className="min-h-12 flex-1 border border-[#d8c49b] bg-[#fffaf1] px-4 text-sm text-[#172a28] outline-none transition focus:border-[#172a28]"
      />
      <button className="min-h-12 rounded-full bg-[#172a28] px-6 text-sm font-semibold text-white transition hover:bg-[#27433f]">
        Search
      </button>
    </form>
  );
}

export function PillList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="text-[#9a907f]">None</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span
          key={value}
          className="rounded-full border border-[#d8c49b] bg-[#fffaf1] px-2.5 py-1 text-xs font-semibold text-[#172a28]"
        >
          {value}
        </span>
      ))}
    </div>
  );
}
