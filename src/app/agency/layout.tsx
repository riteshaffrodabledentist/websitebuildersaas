import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/agency", label: "Overview" },
  { href: "/agency/build", label: "Build site" },
  { href: "/agency/sites", label: "Sites" },
  { href: "/agency/import", label: "Import" },
];

export default function AgencyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-white/80 p-5 md:block">
          <p
            className="text-xl text-stone-900"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Agency
          </p>
          <nav className="mt-8 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-stone-700 transition hover:bg-teal-50 hover:text-teal-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/client"
            className="mt-10 block text-xs text-stone-500 hover:text-teal-700"
          >
            Switch to client →
          </Link>
        </aside>
        <div className="flex-1 p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
