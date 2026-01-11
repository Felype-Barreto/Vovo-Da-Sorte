import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type NumberBallProps = {
  value: number | string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  backgroundColor?: string;
};

export function NumberBall({ value, size = 44, style, textColor = '#0b1220', backgroundColor }: NumberBallProps) {
  const label = typeof value === 'number' ? String(value).padStart(2, '0') : String(value);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <LinearGradient
        colors={backgroundColor ? [backgroundColor, backgroundColor] : ['#f8fafc', '#cbd5e1', '#f1f5f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ball, { borderRadius: size / 2 }]}
      >
        {/* Inner highlight to fake an inset/gloss */}
        <View style={[styles.innerGlow, { borderRadius: size / 2 }]} />
        <Text style={[styles.text, { color: textColor, fontSize: Math.max(14, Math.round(size * 0.34)) }]}>
          {label}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.20)',
    transform: [{ translateY: -8 }, { translateX: -6 }],
  },
  text: {
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
