import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { theme } from './theme';

type Props = {
  label?: string;
  fullHeight?: boolean; // ha Screen-en belül használod, jó a true
};

export function LoadingView({ label = 'Betöltés…', fullHeight = true }: Props) {
  return (
    <View
      style={{
        flex: fullHeight ? 1 : 0,
        minHeight: fullHeight ? undefined : 120,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space.sm,
      }}
    >
      <ActivityIndicator />
      <Text style={{ color: theme.color.muted, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
