import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore, type Profile } from '@/stores/authStore';

export function useProfile() {
  const { profile, setProfile } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateProfile(updates: Partial<Profile>) {
    if (!profile) throw new Error('No profile loaded');

    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data as Profile);
      return data;
    } finally {
      setIsUpdating(false);
    }
  }

  async function uploadAvatar() {
    if (!profile) throw new Error('No profile loaded');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      throw new Error('cancelled');
    }

    const uri = result.assets[0].uri;
    const ext = uri.split('.').pop() ?? 'jpg';
    const fileName = `${profile.id}/avatar.${ext}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    setIsUpdating(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true, contentType: `image/${ext}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: urlData.publicUrl });
      return urlData.publicUrl;
    } finally {
      setIsUpdating(false);
    }
  }

  return {
    profile,
    updateProfile,
    uploadAvatar,
    isUpdating,
  };
}
