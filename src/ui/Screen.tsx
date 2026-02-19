import React from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from './theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  centered?: boolean;
  pad?: number;
};

export function Screen({ children, scroll = false, centered = false, pad = theme.space.lg }: Props) {
  const content = (
    <View
      style={{
        flex: 1,
        padding: pad,
        gap: theme.space.md,
        justifyContent: centered ? 'center' : 'flex-start',
      }}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar barStyle="light-content" />
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}
