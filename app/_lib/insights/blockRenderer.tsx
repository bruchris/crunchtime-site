import type { InsightBlock, RichSpan } from "./types";

function Span({ span }: { span: RichSpan }) {
  let node: React.ReactNode = span.text;
  if (span.code) node = <code className="rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-[0.92em]">{node}</code>;
  if (span.italic) node = <em>{node}</em>;
  if (span.bold) node = <strong className="font-semibold text-[var(--color-fg)]">{node}</strong>;
  if (span.href) {
    node = (
      <a
        href={span.href}
        className="text-[var(--color-accent)] underline decoration-[var(--color-accent)]/40 underline-offset-4 hover:decoration-[var(--color-accent)]"
        rel={span.href.startsWith("http") ? "noopener" : undefined}
      >
        {node}
      </a>
    );
  }
  return <>{node}</>;
}

function Spans({ text }: { text: RichSpan[] }) {
  return (
    <>
      {text.map((s, i) => (
        <Span key={i} span={s} />
      ))}
    </>
  );
}

export function BlockRenderer({ blocks }: { blocks: InsightBlock[] }) {
  return (
    <div className="prose-insight space-y-6 text-[var(--color-fg)]">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}

function Block({ block }: { block: InsightBlock }) {
  switch (block.kind) {
    case "heading": {
      const cls =
        block.level === 2
          ? "font-display mt-12 text-3xl font-extrabold tracking-tight sm:text-4xl"
          : block.level === 3
            ? "font-display mt-10 text-2xl font-bold tracking-tight"
            : "font-display mt-8 text-xl font-bold tracking-tight";
      // Stable id from heading text for AI deep-linking + in-page nav.
      const id = slugify(block.text.map((s) => s.text).join(""));
      const Tag = block.level === 2 ? "h2" : block.level === 3 ? "h3" : "h4";
      return (
        <Tag id={id} className={cls}>
          <Spans text={block.text} />
        </Tag>
      );
    }
    case "paragraph":
      if (block.text.length === 0) return null;
      return (
        <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg sm:leading-8">
          <Spans text={block.text} />
        </p>
      );
    case "bulleted-list":
      return (
        <ul className="ml-6 list-disc space-y-2 text-base leading-7 text-[var(--color-muted)]">
          {block.items.map((item, i) => (
            <li key={i}>
              <Spans text={item} />
            </li>
          ))}
        </ul>
      );
    case "numbered-list":
      return (
        <ol className="ml-6 list-decimal space-y-2 text-base leading-7 text-[var(--color-muted)]">
          {block.items.map((item, i) => (
            <li key={i}>
              <Spans text={item} />
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-[var(--color-accent)] pl-5 text-lg italic text-[var(--color-fg)]">
          <Spans text={block.text} />
        </blockquote>
      );
    case "callout":
      return (
        <aside className="flex gap-3 rounded-md border border-white/10 bg-white/[0.03] p-5">
          {block.emoji ? <span aria-hidden className="text-xl">{block.emoji}</span> : null}
          <p className="text-base leading-7 text-[var(--color-fg)]">
            <Spans text={block.text} />
          </p>
        </aside>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-md border border-white/10 bg-black/40 p-4 font-mono text-sm">
          <code data-language={block.language}>{block.text}</code>
        </pre>
      );
    case "divider":
      return <hr className="border-white/10" />;
    case "image":
      // Using <img> rather than next/image because Notion-hosted file URLs
      // are signed and rotate; next/image's optimizer would cache stale URLs.
      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt={block.alt} className="w-full rounded-md border border-white/10" loading="lazy" />
          {block.alt ? (
            <figcaption className="mt-2 text-sm text-[var(--color-muted)]">{block.alt}</figcaption>
          ) : null}
        </figure>
      );
    case "unsupported":
      // Visible in dev so authors notice; quiet in prod.
      if (process.env.NODE_ENV !== "production") {
        return (
          <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            Unsupported block type: <code>{block.type}</code>
          </p>
        );
      }
      return null;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
