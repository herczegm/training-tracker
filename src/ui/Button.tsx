import React from 'react';
import { Pressable, Text } from 'react-native';
import { theme } from './theme';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger' | 'secondary' | 'ghost';
  leftIcon?: string; // pl. "✅"
};

export function Button({ title, onPress, disabled, variant = 'primary', leftIcon }: Props) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  const bg = isPrimary ? theme.color.primary : 'transparent';
  const border = isPrimary ? 'transparent' : theme.color.border;
  const textColor = isPrimary ? theme.color.primaryText : isDanger ? theme.color.danger : theme.color.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: theme.radius.md,
        backgroundColor: isDanger ? 'transparent' : bg,
        borderWidth: 1,
        borderColor: isDanger ? theme.color.danger : border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Text style={{ color: textColor, fontWeight: '900' }}>
        {leftIcon ? `${leftIcon} ` : ''}
        {title}
      </Text>
    </Pressable>
  );
}
