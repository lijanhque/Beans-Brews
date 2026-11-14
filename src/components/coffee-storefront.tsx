"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Coffee,
  Leaf,
  Menu,
  Moon,
  Plus,
  ShoppingBag,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { IconBrandInstagram } from "@tabler/icons-react";
import { useEffect, useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  CardBody,
  CardContainer,
  CardItem,
} from "@/components/ui/3d-card";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { AccountMenu } from "@/components/account-menu";
import { CartDrawer } from "@/components/cart-drawer";
import { toast } from "@/components/ui/toast";
import { useCart } from "@/lib/cart-context";
import { formatPrice, type Product, type StoreCategory } from "@/lib/store-data";

type StoreJournalEntry = {
  slug: string;
  category: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
};

type StoreBanner = { id: string; title: string; image: string; href: string | null };

const testimonials = [
  {
    quote:
      "My morning coffee used to be a caffeine pit stop. Now it's the nicest five minutes of my day.",
    name: "Maya R.",
    title: "Loves a slow Sunday",
  },
  {
    quote:
      "The kind of coffee that makes you cancel your coffee shop plans. The packaging is so lovely, too.",
    name: "Alex P.",
    title: "Home-barista in training",
  },
  {
    quote:
      "Finally, beans that taste exactly like the little note on the bag says. The apricot one is unreal.",
    name: "Jules K.",
    title: "Three-time bean clubber",
  },
  {
    quote:
      "Gifted the pour-over set to my sister and accidentally kept it for myself. No regrets whatsoever.",
    name: "Sam T.",
    title: "A happy repeat customer",
  },
];

export default function CoffeeStorefront({
  user,
  products,
  categories,
  journalEntries,
  banners,
}: {
  user: { name: string; role: string } | null;
  products: Product[];
  categories: StoreCategory[];
  journalEntries: StoreJournalEntry[];
  banners: StoreBanner[];
}) {
  const router = useRouter();
  const { cartCount, addToCart: addToSharedCart, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<
    "idle" | "success" | "invalid"
  >("idle");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function addToCart(product: Product) {
    addToSharedCart(product);
    openCart();
    toast.add({
      description: `${product.name} is in your shopping bag.`,
      title: "Added to your bag",
      type: "success",
    });
  }

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterState(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)
        ? "success"
        : "invalid",
    );
  }

  function closeMenus() {
    setMenuOpen(false);
    setMegaMenuOpen(false);
  }

  return (
    <>
      <main>
      <div className="announcement">
        <Sparkles aria-hidden="true" size={13} />
        <span>Flat Steadfast delivery · COD, bKash & Nagad available</span>
        <ArrowRight aria-hidden="true" size={13} />
      </div>

      <header className="site-header">
        <a
          href="#home"
          className="brand"
          aria-label="Beans and Brews home"
          onClick={closeMenus}
        >
          <BrandLogo className="brand-logo" />
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="nav-link" href="#home">
            Home
          </a>
          <button
            className={`nav-link nav-menu-trigger${megaMenuOpen ? " is-active" : ""}`}
            onClick={() => setMegaMenuOpen((open) => !open)}
            aria-expanded={megaMenuOpen}
            aria-controls="shop-mega-menu"
          >
            Shop <ChevronDown size={14} />
          </button>
          <a className="nav-link" href="#story">
            Our story
          </a>
          <Link className="nav-link" href="/journal">
            Journal
          </Link>
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle icon-button"
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <AccountMenu user={user} />
          {!user && (
            <>
              <button className="login-button" onClick={() => router.push("/login")}>Log in</button>
              <button
                className="signup-button"
                onClick={() => router.push("/signup")}
              >
                Sign up <ArrowUpRight size={14} />
              </button>
            </>
          )}
          <button
            className="cart-button icon-button"
            aria-label={`Open shopping bag, ${cartCount} items`}
            onClick={openCart}
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
            <span>Bag</span>
            <span className="cart-count">{cartCount}</span>
          </button>
          <button
            className="mobile-menu-button icon-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {megaMenuOpen && (
          <div className="mega-menu" id="shop-mega-menu">
            <div className="mega-menu-intro">
              <span className="eyebrow">A GOOD PLACE TO BEGIN</span>
              <h3>Find your little something.</h3>
              <Link href="/products" onClick={closeMenus}>
                Explore everything <ArrowUpRight size={15} />
              </Link>
            </div>
            <Link href="/categories/coffee-beans" onClick={closeMenus}>
              <Coffee size={20} /> <span>Coffee beans</span>
              <ChevronRight size={15} />
            </Link>
            <Link href="/categories/brewing-things" onClick={closeMenus}>
              <Sparkles size={20} /> <span>Brewing gear</span>
              <ChevronRight size={15} />
            </Link>
            <Link href="/categories/mugs-and-more" onClick={closeMenus}>
              <ShoppingBag size={20} /> <span>Mugs & more</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        )}
      </header>

      {menuOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          <a href="#home" onClick={closeMenus}>
            Home <ArrowUpRight size={17} />
          </a>
          <Link href="/categories" onClick={closeMenus}>
            Coffee & brewing <ArrowUpRight size={17} />
          </Link>
          <Link href="/products" onClick={closeMenus}>
            All the good things <ArrowUpRight size={17} />
          </Link>
          <a href="#story" onClick={closeMenus}>
            Our story <ArrowUpRight size={17} />
          </a>
          <Link href="/journal" onClick={closeMenus}>
            Journal <ArrowUpRight size={17} />
          </Link>
          <div className="mobile-menu-actions">
            {user ? (
              <>
                <Link href="/profile" onClick={closeMenus}>My profile <ArrowUpRight size={14} /></Link>
                <Link href="/orders" onClick={closeMenus}>My orders <ArrowUpRight size={14} /></Link>
              </>
            ) : (
              <>
                <button onClick={() => { closeMenus(); router.push("/login"); }}>Log in</button>
                <button onClick={() => { closeMenus(); router.push("/signup"); }}>
                  Sign up <ArrowUpRight size={14} />
                </button>
              </>
            )}
          </div>
        </nav>
      )}

      <section className="hero section-shell" id="home">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="kicker-line" />
            GOOD DAYS START HERE
          </div>
          <h1>
            Make a little
            <br />
            <span>room for</span> <em>joy.</em>
          </h1>
          <p>
            Thoughtfully sourced beans and lovely little things for your
            favorite part of the day. Take your time. You&apos;re right where
            you need to be.
          </p>
          <div className="hero-actions">
            <Link className="button-dark" href="/products">
              Find your next favorite <ArrowRight size={16} />
            </Link>
            <a className="text-link" href="#story">
              Get to know us <ArrowDownRight size={16} />
            </a>
          </div>
          <div className="hero-note">
            <div className="avatar-stack" aria-hidden="true">
              <span>M</span>
              <span>J</span>
              <span>A</span>
            </div>
            <span>
              <strong>4.9/5</strong> from 2,000+ happy slow mornings
            </span>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span>ROASTED SLOWLY</span>
            <Coffee size={21} />
            <span>SIPPED HAPPILY</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-art-image">
            <Image
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=90"
              alt="A warm cup of coffee on a cozy wooden table"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 55vw"
              unoptimized
            />
          </div>
          <div className="hero-image-label">
            <span className="label-dot" />
            YOUR NEW HAPPY PLACE
          </div>
          <div className="hero-floating-note">
            <span className="floating-icon">
              <Leaf size={17} />
            </span>
            <span>
              <strong>Good, honest beans.</strong>
              <small>Kind to the people and planet.</small>
            </span>
          </div>
          <div className="hero-image-corner" aria-hidden="true">
            <ArrowDownRight size={21} />
          </div>
        </div>
        <a className="hero-scroll" href="#categories">
          <span>TAKE A LITTLE LOOK AROUND</span>
          <ArrowDown size={14} />
        </a>
      </section>

      <section
        className="catering-banner-section section-shell"
        aria-label="Coffee catering and professional barista support"
      >
        <Image
          className="catering-banner"
          src="/home-banner.jpg"
          alt="Premium coffee catering and professional barista support for corporate events, weddings, exhibitions, and private parties. Booking: 01791140842."
          width={1622}
          height={970}
          sizes="(max-width: 760px) calc(100vw - 48px), 86vw"
        />
      </section>

      {banners.length > 0 && (
        <section className="home-banners section-shell" aria-label="Store offers">
          {banners.map((banner) => (
            <Link
              className="home-banner-card"
              href={banner.href || "/products"}
              key={banner.id}
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(48,39,31,.65), rgba(48,39,31,.05)), url("${banner.image}")`,
              }}
            >
              <span className="eyebrow">A LITTLE SOMETHING FOR YOU</span>
              <strong>{banner.title}</strong>
              <span>Explore the offer <ArrowRight size={15} /></span>
            </Link>
          ))}
        </section>
      )}

      <div className="ticker" aria-label="Small batch, big heart, always fresh">
        <div className="ticker-track" aria-hidden="true">
          {Array.from({ length: 2 }, (_, row) => (
            <span className="ticker-group" key={row}>
              <span>SMALL BATCH</span>
              <Sparkles size={15} />
              <span>BIG HEART</span>
              <Sparkles size={15} />
              <span>ALWAYS FRESH</span>
              <Sparkles size={15} />
              <span>NEVER IN A RUSH</span>
              <Sparkles size={15} />
            </span>
          ))}
        </div>
      </div>

      <section className="categories-section section-shell" id="categories">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE GOOD STUFF, RIGHT THIS WAY</span>
            <h2>For the love of a good <em>cup.</em></h2>
          </div>
          <Link className="text-link" href="/products">
            Browse all the good stuff <ArrowRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              className="category-card"
              href={`/categories/${category.slug}`}
              key={category.number}
              style={{ backgroundImage: `url("${category.image}")` }}
            >
              <span className="category-number">{category.number}</span>
              <span className="category-arrow">
                <ArrowUpRight size={17} />
              </span>
              <span className="category-caption">
                <small>{category.note}</small>
                <strong>{category.name}</strong>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="products-section section-shell" id="shop">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE ONES EVERYONE LOVES</span>
            <h2>A few very good <em>things.</em></h2>
          </div>
          <div className="product-arrows">
            <button
              className="round-arrow"
              aria-label="Previous products"
              onClick={() =>
                document
                  .querySelector("#product-grid")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
            >
              <ArrowLeft size={17} />
            </button>
            <button
              className="round-arrow"
              aria-label="Next products"
              onClick={() =>
                document
                  .querySelector("#product-grid")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="product-grid" id="product-grid">
          {products.map((product) => (
            <CardContainer
              className="product-tilt"
              containerClassName="product-tilt-container"
              key={product.id}
            >
              <CardBody className={`product-card ${product.color}`}>
                <div className="product-image">
                  <CardItem translateZ={30} className="product-image-inner">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 760px) 80vw, 24vw"
                      unoptimized
                    />
                  </CardItem>
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}
                  <button
                    className="product-quick-add"
                    aria-label={`Add ${product.name} to bag`}
                    onClick={() => addToCart(product)}
                  >
                    <Plus size={19} />
                  </button>
                </div>
                <div className="product-info">
                  <div>
                    <span className="product-category">{product.category}</span>
                    <h3>{product.name}</h3>
                  </div>
                  <span className="product-price">{formatPrice(product.price)}</span>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>
        <div className="shop-more-wrap">
          <Link className="button-outline" href="/categories">
            A peek at everything <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-image">
          <Image
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=85"
            alt="Coffee beans freshly ground for a slow pour"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            unoptimized
          />
          <span className="story-image-caption">A SMALL ROASTERY WITH A BIG SOFT SPOT.</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">A LITTLE ABOUT US</span>
          <h2>
            The best things
            <br />
            happen <em>slowly.</em>
          </h2>
          <p>
            We started Beans & Brews with a simple thought: what if your
            everyday coffee felt a little more like a treat? So we found
            wonderful growers, made friends with our roaster, and made room
            for all the little things that make a morning yours.
          </p>
          <p>
            Nothing fussy. Nothing rushed. Just really lovely coffee, made by
            people who care.
          </p>
          <Link className="text-link" href="/journal">
            The long version <ArrowUpRight size={16} />
          </Link>
          <div className="story-signature">
            <span className="signature-mark">b&b</span>
            <span>Made with a lot of love, every single day.</span>
          </div>
        </div>
      </section>

      <section className="values-strip section-shell">
        <div className="value-item">
          <span className="value-icon"><Leaf size={20} /></span>
          <span><strong>Good from the ground up</strong><small>Kindly sourced, always.</small></span>
        </div>
        <div className="value-item">
          <span className="value-icon"><Coffee size={20} /></span>
          <span><strong>Roasted with feeling</strong><small>Fresh little batches, weekly.</small></span>
        </div>
        <div className="value-item">
          <span className="value-icon"><Sparkles size={20} /></span>
          <span><strong>Joy in every detail</strong><small>Beautiful things, built to last.</small></span>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="testimonial-heading section-shell">
          <span className="eyebrow">KIND WORDS, WARM HEARTS</span>
          <h2>Don&apos;t just take <em>our word.</em></h2>
          <div className="rating-line">
            <span aria-label="5 out of 5 stars">★★★★★</span>
            <span>4.9 out of 5 from our little coffee community</span>
          </div>
        </div>
        <InfiniteMovingCards
          items={testimonials}
          direction="left"
          speed="slow"
          pauseOnHover
          className="testimonial-scroller"
        />
      </section>

      <section className="journal-section section-shell" id="journal">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SOMETHING GOOD TO READ</span>
            <h2>A little note from <em>us.</em></h2>
          </div>
          <Link className="text-link" href="/journal">
            All our little notes <ArrowRight size={16} />
          </Link>
        </div>
        <div className="journal-grid">
          {journalEntries.map((entry) => (
            <Link className="journal-card" href={`/journal/${entry.slug}`} key={entry.title}>
              <div className="journal-image">
                <Image
                  src={entry.image}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 90vw, 32vw"
                  unoptimized
                />
                <span className="journal-image-arrow"><ArrowUpRight size={17} /></span>
              </div>
              <div className="journal-meta">
                <span>{entry.category}</span>
                <span>{entry.date}</span>
              </div>
              <h3>{entry.title}</h3>
              <span className="journal-read">A two-minute read <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <div className="newsletter-decoration" aria-hidden="true">
          <Coffee size={74} strokeWidth={0.75} />
        </div>
        <div className="newsletter-inner">
          <span className="eyebrow">LETTERS FROM THE SLOW LANE</span>
          <h2>A little goodness in your <em>inbox.</em></h2>
          <p>
            New beans, thoughtful things, and little notes to make your day.
            No noise — just the good stuff.
          </p>
          <form className="newsletter-form" onSubmit={subscribe} noValidate>
            <label className="sr-only" htmlFor="newsletter-email">
              Your email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={newsletterEmail}
              onChange={(event) => {
                setNewsletterEmail(event.target.value);
                setNewsletterState("idle");
              }}
              placeholder="Your email address"
              aria-invalid={newsletterState === "invalid"}
              aria-describedby="newsletter-message"
            />
            <button type="submit">
              Count me in <ArrowRight size={16} />
            </button>
          </form>
          <span
            className={`newsletter-message${newsletterState === "invalid" ? " is-error" : ""}`}
            id="newsletter-message"
            aria-live="polite"
          >
            {newsletterState === "success"
              ? "You're on the list! Look out for a little note from us."
              : newsletterState === "invalid"
                ? "That email doesn't look quite right. Give it another try."
                : "A real human writes these. Unsubscribe whenever."}
          </span>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="#home" className="brand" aria-label="Beans & Brews home">
              <BrandLogo className="brand-logo" width={144} />
            </a>
            <p>For slow sips, soft starts, and everything in between.</p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/" aria-label="Instagram">
                <IconBrandInstagram size={17} stroke={1.7} />
              </a>
              <a href="https://www.pinterest.com/" aria-label="Pinterest">
                <span className="pinterest-mark">p</span>
              </a>
              <a href="mailto:hello@beansandbrews.example" aria-label="Email us">
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <div className="footer-links">
            <div>
              <span className="footer-label">THE GOOD STUFF</span>
              <Link href="/products">All products</Link>
              <Link href="/categories/coffee-beans">Coffee beans</Link>
              <Link href="/categories/brewing-things">Brewing gear</Link>
              <Link href="/categories/mugs-and-more">Mugs & more</Link>
            </div>
            <div>
              <span className="footer-label">GET TO KNOW US</span>
              <a href="#story">Our little story</a>
              <Link href="/journal">The journal</Link>
              <a href="#newsletter">Say hello</a>
              <a href="#newsletter">Shipping & returns</a>
            </div>
            <div className="footer-postcard">
              <span className="eyebrow">FROM OUR TABLE TO YOURS</span>
              <p>May your coffee be warm and your morning be kind.</p>
              <a href="#newsletter">A note from us <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Beans & Brews. Made with a little extra love.</span>
          <div><a href="#newsletter">Privacy</a><a href="#newsletter">Terms</a><a href="#home">Back to the top ↑</a></div>
        </div>
      </footer>

      </main>
      <CartDrawer />
    </>
  );
}
