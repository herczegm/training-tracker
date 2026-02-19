import React from 'react';
import { View } from 'react-native';
import { H3 } from './T';

export function Section({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <H3>{title.toUpperCase()}</H3>
      {right}
    </View>
  );
}
