import React from 'react';
import { Pressable, Text, View } from 'react-native';

/**
 * Glassmorphism Card com estilo Premium
 */
export const GlassmorphismCard: React.FC<{
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}> = ({ children, style, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[
      {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#10b981',
        padding: 16,
        overflow: 'hidden',
      },
      style,
    ]}
  >
    {children}
  </Pressable>
);

/**
 * Número em bolinha estilizada
 */
export const NumberBall: React.FC<{ number: number; hexColor?: string }> = ({
  number,
  hexColor = '#20d361',
}) => (
  <View
    style={{
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: hexColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    }}
  >
    <Text
      style={{
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
      }}
    >
      {String(number).padStart(2, '0')}
    </Text>
  </View>
);

/**
 * Premium Button com estilo
 */
export const PremiumButton: React.FC<{
  label: string;
  onPress: () => void;
  hexColor?: string;
  style?: any;
}> = ({ label, onPress, hexColor = '#20d361', style }) => (
  <Pressable
    onPress={onPress}
    style={[
      {
        backgroundColor: hexColor,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      style,
    ]}
  >
    <Text
      style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
      }}
    >
      {label}
    </Text>
  </Pressable>
);
