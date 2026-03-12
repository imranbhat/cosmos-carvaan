-- Seed car makes (top 30 brands)
INSERT INTO car_makes (name, country, is_popular, sort_order) VALUES
  ('Toyota', 'Japan', TRUE, 1),
  ('Honda', 'Japan', TRUE, 2),
  ('Nissan', 'Japan', TRUE, 3),
  ('BMW', 'Germany', TRUE, 4),
  ('Mercedes-Benz', 'Germany', TRUE, 5),
  ('Audi', 'Germany', TRUE, 6),
  ('Hyundai', 'South Korea', TRUE, 7),
  ('Kia', 'South Korea', TRUE, 8),
  ('Ford', 'USA', TRUE, 9),
  ('Chevrolet', 'USA', TRUE, 10),
  ('Lexus', 'Japan', FALSE, 11),
  ('Porsche', 'Germany', FALSE, 12),
  ('Land Rover', 'UK', FALSE, 13),
  ('Jeep', 'USA', FALSE, 14),
  ('Volkswagen', 'Germany', FALSE, 15),
  ('Mazda', 'Japan', FALSE, 16),
  ('Mitsubishi', 'Japan', FALSE, 17),
  ('Subaru', 'Japan', FALSE, 18),
  ('Infiniti', 'Japan', FALSE, 19),
  ('GMC', 'USA', FALSE, 20),
  ('Dodge', 'USA', FALSE, 21),
  ('Ram', 'USA', FALSE, 22),
  ('Cadillac', 'USA', FALSE, 23),
  ('Genesis', 'South Korea', FALSE, 24),
  ('Volvo', 'Sweden', FALSE, 25),
  ('Jaguar', 'UK', FALSE, 26),
  ('Maserati', 'Italy', FALSE, 27),
  ('Tesla', 'USA', FALSE, 28),
  ('Suzuki', 'Japan', FALSE, 29),
  ('Renault', 'France', FALSE, 30);

-- Seed popular models (Toyota)
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
SELECT id, 'Camry', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'Toyota'
UNION ALL
SELECT id, 'Corolla', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'Toyota'
UNION ALL
SELECT id, 'Land Cruiser', 'suv', 2000, NULL, TRUE FROM car_makes WHERE name = 'Toyota'
UNION ALL
SELECT id, 'RAV4', 'suv', 2005, NULL, TRUE FROM car_makes WHERE name = 'Toyota'
UNION ALL
SELECT id, 'Hilux', 'truck', 2005, NULL, FALSE FROM car_makes WHERE name = 'Toyota'
UNION ALL
SELECT id, 'Yaris', 'hatchback', 2005, NULL, FALSE FROM car_makes WHERE name = 'Toyota';

-- Honda models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
SELECT id, 'Civic', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'Honda'
UNION ALL
SELECT id, 'Accord', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'Honda'
UNION ALL
SELECT id, 'CR-V', 'suv', 2002, NULL, TRUE FROM car_makes WHERE name = 'Honda'
UNION ALL
SELECT id, 'Pilot', 'suv', 2005, NULL, FALSE FROM car_makes WHERE name = 'Honda';

-- Nissan models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
SELECT id, 'Patrol', 'suv', 2000, NULL, TRUE FROM car_makes WHERE name = 'Nissan'
UNION ALL
SELECT id, 'Altima', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'Nissan'
UNION ALL
SELECT id, 'Pathfinder', 'suv', 2005, NULL, FALSE FROM car_makes WHERE name = 'Nissan'
UNION ALL
SELECT id, 'Sentra', 'sedan', 2000, NULL, FALSE FROM car_makes WHERE name = 'Nissan';

-- BMW models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
SELECT id, '3 Series', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'BMW'
UNION ALL
SELECT id, '5 Series', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'BMW'
UNION ALL
SELECT id, 'X5', 'suv', 2005, NULL, TRUE FROM car_makes WHERE name = 'BMW'
UNION ALL
SELECT id, 'X3', 'suv', 2005, NULL, FALSE FROM car_makes WHERE name = 'BMW';

-- Mercedes models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
SELECT id, 'C-Class', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'Mercedes-Benz'
UNION ALL
SELECT id, 'E-Class', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'Mercedes-Benz'
UNION ALL
SELECT id, 'GLE', 'suv', 2010, NULL, TRUE FROM car_makes WHERE name = 'Mercedes-Benz'
UNION ALL
SELECT id, 'GLC', 'suv', 2015, NULL, FALSE FROM car_makes WHERE name = 'Mercedes-Benz';

-- Hyundai models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
SELECT id, 'Tucson', 'suv', 2005, NULL, TRUE FROM car_makes WHERE name = 'Hyundai'
UNION ALL
SELECT id, 'Elantra', 'sedan', 2000, NULL, TRUE FROM car_makes WHERE name = 'Hyundai'
UNION ALL
SELECT id, 'Santa Fe', 'suv', 2005, NULL, FALSE FROM car_makes WHERE name = 'Hyundai'
UNION ALL
SELECT id, 'Sonata', 'sedan', 2000, NULL, FALSE FROM car_makes WHERE name = 'Hyundai';
