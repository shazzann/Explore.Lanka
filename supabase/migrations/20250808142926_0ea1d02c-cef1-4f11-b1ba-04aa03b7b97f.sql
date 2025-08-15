-- Drop current INSERT policy and create the most basic one for testing
DROP POLICY IF EXISTS "Allow authenticated users to upload photos to their folder" ON storage.objects;

-- Create a very permissive policy for testing - allow any authenticated user to upload to photos bucket
CREATE POLICY "Allow authenticated users to upload photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid() IS NOT NULL
);