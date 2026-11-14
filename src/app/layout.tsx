import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beans & Brews — A little daily delight",
  description:
    "Thoughtfully sourced coffee beans and lovely little things for your favorite part of the day. Make a little room for joy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <main className="store-page" aria-busy="true" role="status">
              <div className="page-intro">
                <span className="eyebrow">BEANS & BREWS</span>
                <h1>One little <em>moment.</em></h1>
                <p>We&apos;re getting everything ready for you.</p>
              </div>
            </main>
          }
        >
          <CartProvider>{children}</CartProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
