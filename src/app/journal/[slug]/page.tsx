import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreLayout } from "@/components/store-layout";
import { RichTextContent } from "@/components/rich-text-content";
import { getPublishedPosts } from "@/lib/store-queries";

export default async function JournalArticlePage({
  params,
}: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const journalEntries = await getPublishedPosts();
  const entry = journalEntries.find((article) => article.slug === slug);
  if (!entry) notFound();

  return (
    <StoreLayout>
      <main className="store-page article-page">
        <Link className="eyebrow route-read-link" href="/journal">← BACK TO THE JOURNAL</Link>
        <div className="article-heading">
          <span className="eyebrow">{entry.category} · {entry.date}</span>
          <h1>{entry.title}</h1>
          <p>{entry.excerpt}</p>
          <small className="article-author">By {entry.author}</small>
        </div>
        <div className="article-hero" style={{ backgroundImage: `url("${entry.image}")` }} />
        <div className="article-copy">
          <RichTextContent
            content={entry.content || `${entry.excerpt}\n\nThe best cup is the one you make time for. Make the ritual your own and enjoy the little things.`}
          />
          {entry.tags.length > 0 && (
            <div aria-label="Article tags" className="article-tags">
              {entry.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          )}
          <Link className="route-read-link" href="/products">Find something for your ritual →</Link>
        </div>
      </main>
    </StoreLayout>
  );
}
