-- Seed car makes (top brands available in Kashmir/India)
INSERT INTO car_makes (name, country, is_popular, sort_order) VALUES
  ('Maruti Suzuki', 'India', TRUE, 1),
  ('Hyundai', 'South Korea', TRUE, 2),
  ('Tata', 'India', TRUE, 3),
  ('Mahindra', 'India', TRUE, 4),
  ('Toyota', 'Japan', TRUE, 5),
  ('Kia', 'South Korea', TRUE, 6),
  ('Honda', 'Japan', TRUE, 7),
  ('Renault', 'France', TRUE, 8),
  ('Nissan', 'Japan', TRUE, 9),
  ('MG', 'China', TRUE, 10),
  ('Skoda', 'Czech Republic', FALSE, 11),
  ('Volkswagen', 'Germany', FALSE, 12),
  ('Ford', 'USA', FALSE, 13),
  ('BMW', 'Germany', FALSE, 14),
  ('Mercedes-Benz', 'Germany', FALSE, 15),
  ('Audi', 'Germany', FALSE, 16),
  ('Jeep', 'USA', FALSE, 17),
  ('Citroen', 'France', FALSE, 18),
  ('Isuzu', 'Japan', FALSE, 19),
  ('Force Motors', 'India', FALSE, 20);

-- Maruti Suzuki models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Swift', 'hatchback'::body_type, 2005, NULL, TRUE FROM car_makes WHERE name = 'Maruti Suzuki';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Baleno', 'hatchback'::body_type, 2015, NULL, TRUE FROM car_makes WHERE name = 'Maruti Suzuki';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Brezza', 'suv'::body_type, 2016, NULL, TRUE FROM car_makes WHERE name = 'Maruti Suzuki';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Alto', 'hatchback'::body_type, 2000, NULL, TRUE FROM car_makes WHERE name = 'Maruti Suzuki';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'WagonR', 'hatchback'::body_type, 2000, NULL, TRUE FROM car_makes WHERE name = 'Maruti Suzuki';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Dzire', 'sedan'::body_type, 2008, NULL, TRUE FROM car_makes WHERE name = 'Maruti Suzuki';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Ertiga', 'van'::body_type, 2012, NULL, FALSE FROM car_makes WHERE name = 'Maruti Suzuki';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Grand Vitara', 'suv'::body_type, 2022, NULL, FALSE FROM car_makes WHERE name = 'Maruti Suzuki';

-- Hyundai models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Creta', 'suv'::body_type, 2015, NULL, TRUE FROM car_makes WHERE name = 'Hyundai';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'i20', 'hatchback'::body_type, 2008, NULL, TRUE FROM car_makes WHERE name = 'Hyundai';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Venue', 'suv'::body_type, 2019, NULL, TRUE FROM car_makes WHERE name = 'Hyundai';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Verna', 'sedan'::body_type, 2006, NULL, TRUE FROM car_makes WHERE name = 'Hyundai';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Tucson', 'suv'::body_type, 2005, NULL, FALSE FROM car_makes WHERE name = 'Hyundai';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Grand i10 Nios', 'hatchback'::body_type, 2013, NULL, FALSE FROM car_makes WHERE name = 'Hyundai';

-- Tata models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Nexon', 'suv'::body_type, 2017, NULL, TRUE FROM car_makes WHERE name = 'Tata';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Punch', 'suv'::body_type, 2021, NULL, TRUE FROM car_makes WHERE name = 'Tata';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Harrier', 'suv'::body_type, 2019, NULL, TRUE FROM car_makes WHERE name = 'Tata';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Altroz', 'hatchback'::body_type, 2020, NULL, FALSE FROM car_makes WHERE name = 'Tata';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Safari', 'suv'::body_type, 2021, NULL, FALSE FROM car_makes WHERE name = 'Tata';

-- Mahindra models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Scorpio N', 'suv'::body_type, 2022, NULL, TRUE FROM car_makes WHERE name = 'Mahindra';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Thar', 'suv'::body_type, 2020, NULL, TRUE FROM car_makes WHERE name = 'Mahindra';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'XUV700', 'suv'::body_type, 2021, NULL, TRUE FROM car_makes WHERE name = 'Mahindra';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Bolero', 'suv'::body_type, 2000, NULL, TRUE FROM car_makes WHERE name = 'Mahindra';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'XUV300', 'suv'::body_type, 2019, NULL, FALSE FROM car_makes WHERE name = 'Mahindra';

-- Toyota models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Innova Crysta', 'van'::body_type, 2005, NULL, TRUE FROM car_makes WHERE name = 'Toyota';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Fortuner', 'suv'::body_type, 2009, NULL, TRUE FROM car_makes WHERE name = 'Toyota';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Glanza', 'hatchback'::body_type, 2019, NULL, TRUE FROM car_makes WHERE name = 'Toyota';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Urban Cruiser Hyryder', 'suv'::body_type, 2022, NULL, FALSE FROM car_makes WHERE name = 'Toyota';

-- Kia models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Seltos', 'suv'::body_type, 2019, NULL, TRUE FROM car_makes WHERE name = 'Kia';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Sonet', 'suv'::body_type, 2020, NULL, TRUE FROM car_makes WHERE name = 'Kia';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Carens', 'van'::body_type, 2022, NULL, FALSE FROM car_makes WHERE name = 'Kia';

-- Honda models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'City', 'sedan'::body_type, 2000, NULL, TRUE FROM car_makes WHERE name = 'Honda';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Amaze', 'sedan'::body_type, 2013, NULL, TRUE FROM car_makes WHERE name = 'Honda';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Elevate', 'suv'::body_type, 2023, NULL, FALSE FROM car_makes WHERE name = 'Honda';

-- Renault models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Kwid', 'hatchback'::body_type, 2015, NULL, TRUE FROM car_makes WHERE name = 'Renault';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Kiger', 'suv'::body_type, 2021, NULL, TRUE FROM car_makes WHERE name = 'Renault';

-- Nissan models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Magnite', 'suv'::body_type, 2020, NULL, TRUE FROM car_makes WHERE name = 'Nissan';

-- MG models
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Hector', 'suv'::body_type, 2019, NULL, TRUE FROM car_makes WHERE name = 'MG';
INSERT INTO car_models (make_id, name, body_type, year_start, year_end, is_popular)
  SELECT id, 'Astor', 'suv'::body_type, 2021, NULL, FALSE FROM car_makes WHERE name = 'MG';
