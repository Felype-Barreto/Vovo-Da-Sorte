import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.shell, style]}>
      <View style={styles.overlay}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    padding: 16,
  },
});
