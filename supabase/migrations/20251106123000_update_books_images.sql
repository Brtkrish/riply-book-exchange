-- Add images column to books table (JSON array of strings)
ALTER TABLE public.books ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to images array
UPDATE public.books SET images = CASE
  WHEN image_url IS NOT NULL THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END;

-- Drop the old image_url column
ALTER TABLE public.books DROP COLUMN image_url;
