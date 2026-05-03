import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-lg text-[var(--color-muted)]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-black hover:bg-[var(--color-accent-strong)]"
      >
        Back to home
      </Link>
    </section>
  );
}
