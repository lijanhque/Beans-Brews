"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/store-data";

type Cart = Record<string, { product: Product; quantity: number }>;

type CartContextValue = {
  cart: Cart;
  cartItems: (Product & { quantity: number })[];
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, change: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "beans-brews-cart";
const EMPTY_CART: Cart = {};
let currentCart = EMPTY_CART;
let cartInitialized = false;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    typeof value.collection === "string" &&
    typeof value.price === "number" &&
    typeof value.image === "string" &&
    typeof value.color === "string"
  );
}

function parseCart(value: string): Cart {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed)) return {};

  const validCart: Cart = {};
  for (const [id, entry] of Object.entries(parsed)) {
    if (!isRecord(entry)) continue;
    const product = entry.product;
    const quantity = entry.quantity;
    if (
      isProduct(product) &&
      product.id === id &&
      typeof quantity === "number" &&
      Number.isInteger(quantity) &&
      quantity > 0
    ) {
      validCart[id] = {
        product,
        quantity,
      };
    }
  }
  return validCart;
}

function initializeCart() {
  if (cartInitialized) return;
  cartInitialized = true;

  try {
    const savedCart = window.localStorage.getItem(STORAGE_KEY);
    if (savedCart) currentCart = parseCart(savedCart);
  } catch (error) {
    console.error("Could not read the saved shopping bag:", error);
  }
}

function subscribeToCart(listener: () => void) {
  initializeCart();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function updateCart(update: (cart: Cart) => Cart) {
  initializeCart();
  currentCart = update(currentCart);
  for (const listener of listeners) listener();

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCart));
  } catch (error) {
    console.error("Could not save the shopping bag:", error);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useSyncExternalStore(
    subscribeToCart,
    () => currentCart,
    () => EMPTY_CART,
  );
  const value = useMemo(() => {
    const cartItems = Object.values(cart).map(({ product, quantity }) => ({
      ...product,
      quantity,
    }));
    return {
      cart,
      cartItems,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      cartTotal: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      addToCart: (product: Product) =>
        updateCart((current) => ({
          ...current,
          [product.id]: {
            product,
            quantity: (current[product.id]?.quantity ?? 0) + 1,
          },
        })),
      updateQuantity: (productId: string, change: number) =>
        updateCart((current) => {
          const entry = current[productId];
          if (!entry) return current;
          const quantity = entry.quantity + change;
          if (quantity <= 0) {
            const next = { ...current };
            delete next[productId];
            return next;
          }
          return {
            ...current,
            [productId]: { ...entry, quantity },
          };
        }),
      removeFromCart: (productId: string) =>
        updateCart((current) => {
          const next = { ...current };
          delete next[productId];
          return next;
        }),
      clearCart: () => updateCart(() => ({})),
    };
  }, [cart, cartOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
