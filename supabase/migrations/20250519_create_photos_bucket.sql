
-- Create photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'photos', 'photos', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'photos'
);

-- Set security policies for the photos bucket
CREATE POLICY IF NOT EXISTS "Public Access for photos" 
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY IF NOT EXISTS "Anyone can upload photos" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'photos');
