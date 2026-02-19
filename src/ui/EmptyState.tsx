import React from 'react';
import { Text, View } from 'react-native';
import { theme } from './theme';
import { Button } from './Button';

type Props = {
  icon?: string; // pl. "🗓️"
  title: string;
  description?: string;

  // optional action
  actionTitle?: string;
  onActionPress?: () => void;
  actionVariant?: 'primary' | 'outline' | 'danger';
};

export function EmptyState({
  icon = '✨',
  title,
  description,
  actionTitle,
  onActionPress,
  actionVariant = 'primary',
}: Props) {
  return (
    <View
      style={{
        padding: theme.space.lg,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.color.surface,
        borderWidth: 1,
        borderColor: theme.color.border,
        alignItems: 'center',
        gap: theme.space.sm,
      }}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text style={{ color: theme.color.text, fontWeight: '900', fontSize: 16, textAlign: 'center' }}>
        {title}
      </Text>
      {!!description && (
        <Text style={{ color: theme.color.muted, fontWeight: '600', fontSize: 13, textAlign: 'center' }}>
          {description}
        </Text>
      )}

      {!!actionTitle && !!onActionPress && (
        <View style={{ marginTop: theme.space.sm, width: '100%' }}>
          <Button title={actionTitle} onPress={onActionPress} variant={actionVariant} />
        </View>
      )}
    </View>
  );
}
