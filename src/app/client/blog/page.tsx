export default function ClientBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-stone-900"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Blog
        </h1>
        <p className="mt-2 text-stone-600">
          Blog editors can draft posts with BlogPosting schema. Imported
          WordPress posts land here with redirects preserved.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-12 text-center text-stone-600">
        No posts yet.
      </div>
    </div>
  );
}
