INSERT INTO "category" ("id", "name", "slug", "description", "image")
VALUES
  ('category-barista-tools', 'Barista Tools', 'barista-tools', 'The little tools that make every cup feel considered.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85'),
  ('category-cleaning-maintenance-tools', 'Cleaning & Maintenance Tools', 'cleaning-maintenance-tools', 'Keep your coffee gear clean and ready for the next brew.', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1000&q=85'),
  ('category-gift-boxes-coffee-sets', 'Gift Boxes & Coffee Sets', 'gift-boxes-coffee-sets', 'Thoughtful coffee gifts and sets for sharing.', 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=85'),
  ('category-coffee-tools-equipment', 'Coffee Tools & Equipment', 'coffee-tools-equipment', 'Dependable equipment for a better brew at home.', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1000&q=85')
ON CONFLICT ("slug") DO NOTHING;
