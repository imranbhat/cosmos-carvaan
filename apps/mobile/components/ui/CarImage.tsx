import { useCallback, useEffect, useRef, useState } from 'react';
import { findNodeHandle, Platform, StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

interface CarImageProps {
  uri: string | undefined;
  style?: any;
  borderRadius?: number;
}

/**
 * Cross-platform car image.
 * - Native: expo-image with blurhash + caching
 * - Web: sets CSS background-image on the underlying DOM node via ref
 */
export function CarImage({ uri, style, borderRadius: br }: CarImageProps) {
  const [error, setError] = useState(false);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !uri || error || !viewRef.current) return;

    // On RN Web, findNodeHandle returns the actual DOM node
    try {
      const node = findNodeHandle(viewRef.current);
      const domEl = (typeof node === 'number') ? null : (node as unknown as HTMLElement);
      // Alternatively, viewRef.current might be the DOM element directly
      const el: HTMLElement | null = domEl ?? (viewRef.current as any as HTMLElement);

      if (el && typeof el.style !== 'undefined') {
        el.style.backgroundImage = `url(${uri})`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
      }
    } catch {
      // Silently fail on native
    }
  }, [uri, error]);

  if (!uri || error) {
    return <View style={[styles.placeholder, style, br != null && { borderRadius: br }]} />;
  }

  if (Platform.OS === 'web') {
    return (
      <View
        ref={viewRef}
        style={[styles.container, style, br != null && { borderRadius: br }]}
      />
    );
  }

  return (
    <ExpoImage
      source={{ uri }}
      style={[styles.image, style, br != null && { borderRadius: br }]}
      contentFit="cover"
      transition={300}
      placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
      onError={() => setError(true)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
});
