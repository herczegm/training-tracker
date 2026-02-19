import React from 'react';
import { Text, View } from 'react-native';
import { theme } from './theme';

type Props = { label: string; tone?: 'primary' | 'muted' | 'danger' | 'info' | 'warn' };

export function Badge({ label, tone = 'muted' }: Props) {
  const map = {
    primary: theme.color.primary,
    danger: theme.color.danger,
    info: theme.color.info,
    warn: theme.color.warn,
    muted: theme.color.border,
  };

  const c = map[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: c,
        backgroundColor: 'rgba(255,255,255,0.03)',
      }}
    >
      <Text style={{ color: tone === 'muted' ? theme.color.muted : c, fontWeight: '900', fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}
