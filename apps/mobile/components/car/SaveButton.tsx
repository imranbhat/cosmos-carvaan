import { Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { colors } from '@/constants/theme';
import { useSavedCarIds, useToggleSave } from '@/hooks/useSavedCar';

interface SaveButtonProps {
  listingId: string;
  size?: number;
}

export function SaveButton({ listingId, size = 22 }: SaveButtonProps) {
  const { data: savedIds = [] } = useSavedCarIds();
  const { mutate: toggle } = useToggleSave();
  const isSaved = savedIds.includes(listingId);

  return (
    <Pressable
      onPress={() => toggle(listingId)}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
      hitSlop={12}
    >
      <SymbolView
        name={{
          ios: isSaved ? 'heart.fill' : 'heart',
          android: isSaved ? 'favorite' : 'favorite_border',
          web: 'favorite',
        }}
        tintColor={isSaved ? colors.error : colors.textTertiary}
        size={size}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});
