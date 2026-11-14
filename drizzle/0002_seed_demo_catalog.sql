INSERT INTO "category" ("id", "name", "slug", "description", "image")
VALUES
  ('category-coffee-beans', 'Coffee beans', 'coffee-beans', 'Little bags, big feelings.', 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=85'),
  ('category-brewing-things', 'Brewing things', 'brewing-things', 'Tools for your ritual.', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1000&q=85'),
  ('category-mugs-and-more', 'Mugs & more', 'mugs-and-more', 'Your new favorite cup.', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "product" ("id", "slug", "name", "description", "category_id", "price_bdt", "images", "stock", "active", "featured")
SELECT
  seed.id,
  seed.slug,
  seed.name,
  seed.description,
  category.id,
  seed.price_bdt,
  seed.images::jsonb,
  20,
  true,
  seed.featured
FROM (
  VALUES
    ('1', 'sunday-morning-blend', 'Sunday Morning Blend', 'A soft, balanced whole-bean coffee for unhurried mornings.', 'coffee-beans', 950, '["https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=900&q=85"]', true),
    ('2', 'the-slow-pour-set', 'The Slow Pour Set', 'A simple ceramic dripper set made for a slower daily ritual.', 'brewing-things', 2100, '["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85"]', true),
    ('3', 'little-cloud-pitcher', 'Little Cloud Pitcher', 'A lovely stainless-steel pitcher sized for your everyday cup.', 'mugs-and-more', 1700, '["https://images.unsplash.com/photo-1517256673644-36ad11246d21?auto=format&fit=crop&w=900&q=85"]', false),
    ('4', 'after-hours-espresso', 'After Hours Espresso', 'A rich whole-bean espresso blend for the end of the day.', 'coffee-beans', 1100, '["https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85"]', false)
) AS seed(id, slug, name, description, category_slug, price_bdt, images, featured)
JOIN "category" AS category ON category.slug = seed.category_slug
ON CONFLICT DO NOTHING;