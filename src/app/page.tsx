import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 0%, #99f6e4 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 10%, #fed7aa 0%, transparent 50%), linear-gradient(180deg, #f6f3ee 0%, #efeae3 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <p
            className="text-2xl tracking-tight text-stone-900"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Dental SEO Builder
          </p>
          <div className="flex gap-3">
            <Link
              href="/agency"
              className="rounded-full border border-stone-300 bg-white/70 px-4 py-2 text-sm text-stone-800 backdrop-blur transition hover:bg-white"
            >
              Agency
            </Link>
            <Link
              href="/client"
              className="rounded-full bg-teal-700 px-4 py-2 text-sm text-white transition hover:bg-teal-800"
            >
              Client login
            </Link>
          </div>
        </header>

        <section className="mt-24 max-w-3xl">
          <h1
            className="text-5xl leading-tight text-stone-900 md:text-6xl"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Build dental sites that rank — from a command, not a clone mess.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-stone-600">
            SEO-locked pages, mandatory FAQs and schemas, AI ALT + geo tags,
            humanize then Copyleaks verify, and one Lightsail box per site.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/agency"
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Open agency dashboard
            </Link>
            <Link
              href="/agency/build"
              className="rounded-full border border-stone-400 bg-white/60 px-6 py-3 text-sm font-medium text-stone-800 backdrop-blur transition hover:bg-white"
            >
              Build from command
            </Link>
          </div>
        </section>

        <section className="mt-auto grid gap-4 py-16 md:grid-cols-3">
          {[
            {
              title: "Command build",
              body: "Describe the practice — get pages, SEO, FAQ, and schemas.",
            },
            {
              title: "Client team access",
              body: "Admin, editor, and blogger roles with their own logins.",
            },
            {
              title: "Import when needed",
              body: "Cornerstone content extracted — zero theme JavaScript shipped.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-stone-200/80 bg-white/70 p-5 backdrop-blur"
            >
              <h2 className="text-lg font-semibold text-stone-900">{item.title}</h2>
              <p className="mt-2 text-sm text-stone-600">{item.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
