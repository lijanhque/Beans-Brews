import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StoreLayout } from "@/components/store-layout";
import { getPublishedPosts } from "@/lib/store-queries";

export default async function JournalPage() {
  const journalEntries = await getPublishedPosts();
  return (
    <StoreLayout>
      <main className="store-page">
        <div className="page-intro">
          <span className="eyebrow">NOTES FROM OUR LITTLE CORNER</span>
          <h1>The <em>slow life</em> journal.</h1>
          <p>Little notes on good coffee, good people, and enjoying the in-between.</p>
        </div>
        <div className="route-journal-grid">
          {journalEntries.map((entry) => (
            <article className="route-journal-card" key={entry.slug}>
              <Link
                className="route-journal-image"
                href={`/journal/${entry.slug}`}
                style={{ backgroundImage: `url("${entry.image}")` }}
                aria-label={entry.title}
              />
              <span className="eyebrow">{entry.category} · {entry.date}</span>
              <h2><Link href={`/journal/${entry.slug}`}>{entry.title}</Link></h2>
              <p>{entry.excerpt}</p>
              <Link className="route-read-link" href={`/journal/${entry.slug}`}>
                Read the story <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </main>
    </StoreLayout>
  );
}
