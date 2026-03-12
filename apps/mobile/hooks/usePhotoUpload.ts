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
      quality: 1,
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
      quality: 1,
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

    // Use the picker's built-in quality setting; add expo-image-manipulator later for resizing
    const filename = `listings/${draftId}/${position}.jpg`;

    const response = await fetch(localUri);
    const blob = await response.blob();

    setProgress((p) => ({ ...p, [position]: 50 }));

    const { error } = await supabase.storage
      .from('car-photos')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

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
            } catch {
              attempts++;
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
