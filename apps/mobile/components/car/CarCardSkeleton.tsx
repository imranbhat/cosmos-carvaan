import { StyleSheet, View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors, borderRadius, spacing, shadows } from '@/constants/theme';

function ShimmerLine({ width, height = 14, style }: { width: string | number; height?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as any, height, backgroundColor: colors.shimmer, borderRadius: borderRadius.sm, opacity },
        style,
      ]}
    />
  );
}

export function CarCardSkeleton() {
  return (
    <View style={[styles.card, shadows.card]}>
      <ShimmerLine width="100%" height={220} style={{ borderRadius: 0 }} />
      <View style={styles.info}>
        <ShimmerLine width="45%" height={22} />
        <ShimmerLine width="65%" height={16} style={{ marginTop: spacing.sm }} />
        <View style={styles.chips}>
          <ShimmerLine width={60} height={22} style={{ borderRadius: borderRadius.sm }} />
          <ShimmerLine width={50} height={22} style={{ borderRadius: borderRadius.sm }} />
          <ShimmerLine width={70} height={22} style={{ borderRadius: borderRadius.sm }} />
        </View>
        <ShimmerLine width="30%" height={12} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  info: {
    padding: spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
