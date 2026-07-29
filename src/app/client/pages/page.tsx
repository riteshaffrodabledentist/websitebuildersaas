export default function ClientPagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-stone-900"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Pages
        </h1>
        <p className="mt-2 text-stone-600">
          Create pages from dental templates. H1/H2/H3 levels stay locked; FAQ is
          mandatory before publish.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-12 text-center text-stone-600">
        No pages yet — ask your agency to build a site, or create one when
        permitted.
      </div>
    </div>
  );
}
