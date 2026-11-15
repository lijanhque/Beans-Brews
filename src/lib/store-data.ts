export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  description?: string;
  price: number;
  compareAtPriceBdt?: number;
  image: string;
  images?: string[];
  color: string;
  badge?: string;
  stock?: number;
};

export type StoreCategory = {
  slug: string;
  name: string;
  note: string;
  number: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "1",
    slug: "sunday-morning-blend",
    name: "Sunday Morning Blend",
    category: "Whole bean · 250g",
    collection: "coffee-beans",
    price: 950,
    image:
      "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=900&q=85",
    color: "sand",
    badge: "BESTSELLER",
  },
  {
    id: "2",
    slug: "the-slow-pour-set",
    name: "The Slow Pour Set",
    category: "Ceramic dripper · Sand",
    collection: "brewing-things",
    price: 2100,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    color: "peach",
    badge: "MADE FOR MORNINGS",
  },
  {
    id: "3",
    slug: "little-cloud-pitcher",
    name: "Little Cloud Pitcher",
    category: "Stainless steel · 350ml",
    collection: "mugs-and-more",
    price: 1700,
    image:
      "https://images.unsplash.com/photo-1517256673644-36ad11246d21?auto=format&fit=crop&w=900&q=85",
    color: "sage",
  },
  {
    id: "4",
    slug: "after-hours-espresso",
    name: "After Hours Espresso",
    category: "Whole bean · 250g",
    collection: "coffee-beans",
    price: 1100,
    image:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85",
    color: "cream",
    badge: "NEW CROP",
  },
];

export const categories = [
  {
    slug: "coffee-beans",
    name: "Coffee beans",
    note: "Little bags, big feelings.",
    number: "01",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "brewing-things",
    name: "Brewing things",
    note: "Tools for your ritual.",
    number: "02",
    image:
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "mugs-and-more",
    name: "Mugs & more",
    note: "Your new favorite cup.",
    number: "03",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "barista-tools",
    name: "Barista Tools",
    note: "The little tools that make every cup feel considered.",
    number: "04",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "cleaning-maintenance-tools",
    name: "Cleaning & Maintenance Tools",
    note: "Keep your coffee gear clean and ready for the next brew.",
    number: "05",
    image:
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "gift-boxes-coffee-sets",
    name: "Gift Boxes & Coffee Sets",
    note: "Thoughtful coffee gifts and sets for sharing.",
    number: "06",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "coffee-tools-equipment",
    name: "Coffee Tools & Equipment",
    note: "Dependable equipment for a better brew at home.",
    number: "07",
    image:
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1000&q=85",
  },
];

export const journalEntries = [
  {
    slug: "a-softer-start",
    category: "THE SLOW LIFE",
    title: "A softer start: making a ritual out of your morning cup",
    date: "04.18.25",
    image:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=85",
    excerpt:
      "A good morning ritual doesn't need to be complicated. Start with a cup, a little quiet, and a few minutes that belong to you.",
  },
  {
    slug: "forgiving-french-press",
    category: "BREW NOTES",
    title: "The very forgiving guide to making better French press",
    date: "04.02.25",
    image:
      "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=1000&q=85",
    excerpt:
      "Fresh coffee, hot water, and four unhurried minutes are all you need. Here are a few small tweaks for a sweeter, fuller cup.",
  },
  {
    slug: "meet-the-growers",
    category: "FROM THE ROASTER",
    title: "Meet the growers behind your new favorite little bean",
    date: "03.21.25",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=85",
    excerpt:
      "Great coffee begins long before the roast. Meet the people and places that make our seasonal coffees worth slowing down for.",
  },
];

export function formatPrice(price: number) {
  return `৳${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(price)}`;
}
