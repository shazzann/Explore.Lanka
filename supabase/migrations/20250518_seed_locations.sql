
-- Add popular Sri Lankan locations to the locations table
INSERT INTO public.locations (name, description, short_description, latitude, longitude, region, category, image_url, points, is_active)
VALUES
  ('Sigiriya', 'Ancient rock fortress with frescoes and gardens, dating back to the 5th century.', 'Ancient rock fortress', 7.9570, 80.7603, 'Central Province', 'Historical', 'https://images.unsplash.com/photo-1586516493203-bd035ff81154', 100, true),
  
  ('Kandy Temple of the Tooth', 'Sacred Buddhist temple housing the relic of the tooth of Buddha.', 'Sacred Buddhist temple', 7.2936, 80.6413, 'Central Province', 'Religious', 'https://images.unsplash.com/photo-1575985812603-064a9e66eb41', 80, true),
  
  ('Galle Fort', '17th-century Dutch fort and UNESCO World Heritage Site.', 'Dutch colonial fort', 6.0300, 80.2167, 'Southern Province', 'Colonial', 'https://images.unsplash.com/photo-1586157016074-86afd5b5de42', 75, true),
  
  ('Yala National Park', 'Famous wildlife sanctuary with the highest leopard density in the world.', 'Famous wildlife sanctuary', 6.3352, 81.5312, 'Southern Province', 'Nature', 'https://images.unsplash.com/photo-1590094630803-a4c91ff648d6', 90, true),
  
  ('Nine Arches Bridge', 'Colonial-era railway bridge built entirely of stone, brick, and cement without steel.', 'Colonial-era railway bridge', 6.8782, 81.0567, 'Uva Province', 'Colonial', 'https://images.unsplash.com/photo-1627894483216-2138af692e32', 60, true),
  
  ('Ella Rock', 'Scenic hiking spot with panoramic views of tea plantations and valleys.', 'Scenic hiking spot', 6.8666, 81.0466, 'Uva Province', 'Nature', 'https://images.unsplash.com/photo-1594106345685-c0ba04326622', 85, true),
  
  ('Dambulla Cave Temple', 'UNESCO World Heritage Site with Buddhist mural paintings and statues.', 'Ancient cave temple', 7.8538, 80.6508, 'Central Province', 'Religious', 'https://images.unsplash.com/photo-1596068587619-e4b11c7a3488', 70, true),
  
  ('Polonnaruwa Ancient City', 'Second most ancient kingdom of Sri Lanka with impressive ruins and monuments.', 'Ancient kingdom ruins', 7.9403, 81.0188, 'North Central Province', 'Historical', 'https://images.unsplash.com/photo-1651494075878-f83a9ed766a1', 95, true),
  
  ('Mirissa Beach', 'Popular beach destination known for whale watching and surfing.', 'Beach for whale watching', 5.9483, 80.4563, 'Southern Province', 'Beach', 'https://images.unsplash.com/photo-1625127965561-e021ddc6a9a9', 65, true),
  
  ('Adams Peak', 'Sacred mountain with Buddha footprint that attracts pilgrims from all religions.', 'Sacred pilgrimage mountain', 6.8096, 80.4994, 'Sabaragamuwa Province', 'Religious', 'https://images.unsplash.com/photo-1560964645-5296b5099677', 110, true);

-- Add facts for each location
INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'Sigiriya means "Lion Rock" in Sinhalese.'
FROM public.locations
WHERE name = 'Sigiriya';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The ancient fortress was built by King Kassapa in the 5th century AD.'
FROM public.locations
WHERE name = 'Sigiriya';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The site features some of the oldest landscaped gardens in the world.'
FROM public.locations
WHERE name = 'Sigiriya';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The temple was built within the royal palace complex of the Kingdom of Kandy.'
FROM public.locations
WHERE name = 'Kandy Temple of the Tooth';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'It houses the relic of the tooth of Buddha, an object of veneration for Buddhists.'
FROM public.locations
WHERE name = 'Kandy Temple of the Tooth';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'Galle Fort was built by the Portuguese in 1588 and extensively fortified by the Dutch in the 17th century.'
FROM public.locations
WHERE name = 'Galle Fort';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The fort is a UNESCO World Heritage Site and the largest remaining European-built fortress in Asia.'
FROM public.locations
WHERE name = 'Galle Fort';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'Yala has the highest density of leopards in the world.'
FROM public.locations
WHERE name = 'Yala National Park';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The park is home to 44 varieties of mammals and 215 bird species.'
FROM public.locations
WHERE name = 'Yala National Park';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The bridge is almost 100 feet high and spans 300 feet.'
FROM public.locations
WHERE name = 'Nine Arches Bridge';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'It was built during World War I, at a time when steel was in short supply.'
FROM public.locations
WHERE name = 'Nine Arches Bridge';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The hike to the top takes approximately 2 hours.'
FROM public.locations
WHERE name = 'Ella Rock';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'From the summit, you can see all the way to the south coast on a clear day.'
FROM public.locations
WHERE name = 'Ella Rock';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'There are 153 Buddha statues and numerous paintings in the 5 caves.'
FROM public.locations
WHERE name = 'Dambulla Cave Temple';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The caves date back to the 1st century BC.'
FROM public.locations
WHERE name = 'Dambulla Cave Temple';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The ancient city was the second capital of Sri Lanka after Anuradhapura.'
FROM public.locations
WHERE name = 'Polonnaruwa Ancient City';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'King Parakramabahu I (1153-1186 AD) was mainly responsible for its construction.'
FROM public.locations
WHERE name = 'Polonnaruwa Ancient City';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The beach is famous for whale watching, with blue whales and sperm whales seen regularly.'
FROM public.locations
WHERE name = 'Mirissa Beach';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'It has become one of the most popular tourist beaches in Sri Lanka.'
FROM public.locations
WHERE name = 'Mirissa Beach';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The mountain stands 2,243 meters (7,359 feet) tall.'
FROM public.locations
WHERE name = 'Adams Peak';

INSERT INTO public.location_facts (location_id, fact)
SELECT id, 'The footprint at the summit is revered by multiple religions: Buddhists believe it is Buddha''s footprint, Hindus believe it belongs to Lord Shiva, and Muslims and Christians believe it is Adam''s first step after being exiled from the Garden of Eden.'
FROM public.locations
WHERE name = 'Adams Peak';
