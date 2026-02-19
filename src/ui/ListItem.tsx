import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from './theme';

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;

  // right side
  rightText?: string;
  rightBadge?: React.ReactNode; // pl. <Badge ... />
  chevron?: boolean;

  // visuals
  leftIcon?: string; // pl. "📍" / "👤"
  disabled?: boolean;
};

export function ListItem({
  title,
  subtitle,
  onPress,
  rightText,
  rightBadge,
  chevron = true,
  leftIcon,
  disabled,
}: Props) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.md,
      }}
    >
      {!!leftIcon && (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: theme.radius.md,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: theme.color.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16 }}>{leftIcon}</Text>
        </View>
      )}

      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: theme.color.text, fontWeight: '900', fontSize: 14 }} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={{ color: theme.color.muted, fontWeight: '600', fontSize: 12 }} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        {!!rightBadge && rightBadge}
        {!!rightText && (
          <Text style={{ color: theme.color.muted, fontWeight: '800', fontSize: 12 }} numberOfLines={1}>
            {rightText}
          </Text>
        )}
      </View>

      {chevron && (
        <Text style={{ color: theme.color.subtle, fontWeight: '900', marginLeft: 6 }}>
          ›
        </Text>
      )}
    </View>
  );

  if (!onPress) {
    return (
      <View
        style={{
          padding: theme.space.md,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.color.surface,
          borderWidth: 1,
          borderColor: theme.color.border,
        }}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        padding: theme.space.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.color.surface,
        borderWidth: 1,
        borderColor: theme.color.border,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      {content}
    </Pressable>
  );
}
