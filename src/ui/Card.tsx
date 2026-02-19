import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { theme } from './theme';

export function Card({ style, ...props }: ViewProps) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.color.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.color.border,
          padding: theme.space.lg,
        },
        Platform.OS === 'web' ? theme.shadow.cardWeb : theme.shadow.card,
        style,
      ]}
    />
  );
}
