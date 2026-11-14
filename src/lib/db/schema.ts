import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: text("role").notNull().default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    image: text("image"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("category_name_idx").on(table.name)],
);

export const product = pgTable(
  "product",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    priceBdt: integer("price_bdt").notNull(),
    compareAtPriceBdt: integer("compare_at_price_bdt"),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    stock: integer("stock").notNull().default(0),
    active: boolean("active").notNull().default(true),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("product_category_id_idx").on(table.categoryId),
    index("product_active_idx").on(table.active),
  ],
);

export const offer = pgTable(
  "offer",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").references(() => product.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    discountType: text("discount_type").notNull().default("percent"),
    discountValue: integer("discount_value").notNull(),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("offer_product_id_idx").on(table.productId),
    index("offer_active_idx").on(table.active),
  ],
);

export const customerProfile = pgTable("customer_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const order = pgTable(
  "customer_order",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("pending"),
    subtotalBdt: integer("subtotal_bdt").notNull(),
    deliveryFeeBdt: integer("delivery_fee_bdt").notNull(),
    totalBdt: integer("total_bdt").notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    deliveryProvider: text("delivery_provider").notNull().default("steadfast"),
    paymentMethod: text("payment_method").notNull(),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    paymentReference: text("payment_reference"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("customer_order_user_id_idx").on(table.userId),
    index("customer_order_status_idx").on(table.status),
    index("customer_order_created_at_idx").on(table.createdAt),
  ],
);

export const orderItem = pgTable(
  "order_item",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    productName: text("product_name").notNull(),
    unitPriceBdt: integer("unit_price_bdt").notNull(),
    quantity: integer("quantity").notNull(),
    image: text("image"),
  },
  (table) => [index("order_item_order_id_idx").on(table.orderId)],
);

export const favorite = pgTable(
  "favorite",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.productId] }),
    index("favorite_product_id_idx").on(table.productId),
  ],
);

export const inventoryMovement = pgTable(
  "inventory_movement",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    quantityChange: integer("quantity_change").notNull(),
    reason: text("reason").notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("inventory_movement_product_id_idx").on(table.productId)],
);

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => order.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoice_number").notNull().unique(),
    issuedAt: timestamp("issued_at").notNull().defaultNow(),
  },
);

export const blogPost = pgTable(
  "blog_post",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""),
    image: text("image"),
    category: text("category").notNull().default("Journal"),
    author: text("author").notNull().default("Beans & Brews"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    featured: boolean("featured").notNull().default(false),
    status: text("status").notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("blog_post_status_idx").on(table.status),
    index("blog_post_published_at_idx").on(table.publishedAt),
    index("blog_post_status_published_at_idx").on(table.status, table.publishedAt),
  ],
);

export const banner = pgTable(
  "banner",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    image: text("image").notNull(),
    href: text("href"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("banner_active_idx").on(table.active)],
);

export const supportTicket = pgTable(
  "support_ticket",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("open"),
    adminReply: text("admin_reply"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("support_ticket_user_id_idx").on(table.userId),
    index("support_ticket_status_idx").on(table.status),
  ],
);
