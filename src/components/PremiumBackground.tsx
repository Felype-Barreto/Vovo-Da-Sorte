import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect, Text as SvgText } from 'react-native-svg';

export function PremiumBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        // Darker clover-green gradient
        colors={['#0F7A3E', '#073421']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle $ watermark pattern */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="dollar" width={140} height={140} patternUnits="userSpaceOnUse">
            <SvgText
              x="70"
              y="92"
              fontSize="72"
              fontWeight="800"
              textAnchor="middle"
              fill="#111827"
              opacity="0.12"
            >
              $
            </SvgText>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dollar)" />
      </Svg>
    </View>
  );
}
