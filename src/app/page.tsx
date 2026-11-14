import { Suspense } from "react";
import CoffeeStorefront from "@/components/coffee-storefront";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getActiveBanners,
  getPublishedPosts,
  getStoreCategories,
  getStoreProducts,
} from "@/lib/store-queries";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="store-page" aria-busy="true" role="status">
          <div className="page-intro">
            <span className="eyebrow">BEANS & BREWS</span>
            <h1>Opening <em>the shop.</em></h1>
            <p>Freshly brewed favorites are on their way.</p>
          </div>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const [session, products, categories, journalEntries, banners] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getStoreProducts(),
    getStoreCategories(),
    getPublishedPosts(),
    getActiveBanners(),
  ]);
  return (
    <CoffeeStorefront
      banners={banners}
      categories={categories}
      journalEntries={journalEntries}
      products={products}
      user={session ? { name: session.user.name, role: session.user.role ?? "user" } : null}
    />
  );
}
