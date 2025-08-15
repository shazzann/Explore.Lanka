-- Drop the current INSERT policy and recreate with simpler logic
DROP POLICY IF EXISTS "Allow authenticated users to upload photos to their folder" ON storage.objects;

-- Create a simpler INSERT policy that just checks auth.uid()
CREATE POLICY "Allow authenticated users to upload photos to their folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);