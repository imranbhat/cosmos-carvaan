import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import type { PhotoSlot } from '@/stores/sellStore';

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<number, number>>({});

  const pickImage = async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  };

  const takePhoto = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  };

  const uploadPhoto = async (
    localUri: string,
    draftId: string,
    position: number
  ): Promise<string> => {
    setProgress((p) => ({ ...p, [position]: 0 }));

    const filename = `listings/${draftId}/${position}.jpg`;

    // Use FormData — the most reliable upload method in React Native
    const formData = new FormData();
    formData.append('', {
      uri: localUri,
      name: `${position}.jpg`,
      type: 'image/jpeg',
    } as any);

    setProgress((p) => ({ ...p, [position]: 30 }));

    // Upload using the Supabase REST API directly with FormData
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/car-photos/${filename}`;

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-upsert': 'true',
      },
      body: formData,
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[upload] Storage upload failed (${res.status}):`, errBody);
      throw new Error(`Upload failed: ${res.status}`);
    }

    setProgress((p) => ({ ...p, [position]: 100 }));

    const { data: urlData } = supabase.storage
      .from('car-photos')
      .getPublicUrl(filename);

    return urlData.publicUrl;
  };

  const uploadAllPhotos = async (
    photos: PhotoSlot[],
    draftId: string
  ): Promise<PhotoSlot[]> => {
    setUploading(true);
    try {
      const results = await Promise.all(
        photos.map(async (photo) => {
          if (photo.uploaded && photo.remoteUrl) return photo;

          let attempts = 0;
          while (attempts < 3) {
            try {
              const url = await uploadPhoto(photo.uri, draftId, photo.position);
              return { ...photo, remoteUrl: url, uploaded: true };
            } catch (err) {
              attempts++;
              console.error(`[upload] Photo ${photo.position} attempt ${attempts} failed:`, err);
              if (attempts >= 3) throw new Error(`Failed to upload photo ${photo.position + 1}`);
            }
          }
          return photo;
        })
      );
      return results;
    } finally {
      setUploading(false);
    }
  };

  return { pickImage, takePhoto, uploadPhoto, uploadAllPhotos, uploading, progress };
}
