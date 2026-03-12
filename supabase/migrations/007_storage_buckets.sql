-- Car photos bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('car-photos', 'car-photos', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

CREATE POLICY "car_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-photos');

CREATE POLICY "car_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'car-photos' AND auth.role() = 'authenticated');

CREATE POLICY "car_photos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'car-photos' AND auth.role() = 'authenticated');

-- Avatars bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Chat images bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-images', 'chat-images', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

CREATE POLICY "chat_images_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-images'
    AND EXISTS (SELECT 1 FROM conversations
      WHERE conversations.id::text = (storage.foldername(name))[1]
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid()))
  );

CREATE POLICY "chat_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images'
    AND EXISTS (SELECT 1 FROM conversations
      WHERE conversations.id::text = (storage.foldername(name))[1]
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid()))
  );
