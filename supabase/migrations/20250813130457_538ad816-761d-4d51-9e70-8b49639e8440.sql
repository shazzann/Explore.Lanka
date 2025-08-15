-- Update Jisfaaz's points to include the 2 photo likes (400 + 2 = 402)
UPDATE public.profiles 
SET points = 402, updated_at = now() 
WHERE username = 'Jisfaaz';