-- Clean up all existing storage policies for photos and recreate them properly
DROP POLICY IF EXISTS "Photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Photos are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- Create clean, working policies for photos bucket
CREATE POLICY "Allow public read access to photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Allow authenticated users to upload photos to their folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update their own photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'photos' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'photos' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);