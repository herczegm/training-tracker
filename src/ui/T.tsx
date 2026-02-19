import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { theme } from './theme';

type Props = {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
} & Omit<TextProps, 'style'>;

export function H1({ children, style, ...rest }: Props) {
  return <Text {...rest} style={[theme.text.h1, { color: theme.color.text }, style]}>{children}</Text>;
}

export function H2({ children, style, ...rest }: Props) {
  return <Text {...rest} style={[theme.text.h2, { color: theme.color.text }, style]}>{children}</Text>;
}

export function H3({ children, style, ...rest }: Props) {
  return <Text {...rest} style={[theme.text.h3, { color: theme.color.text }, style]}>{children}</Text>;
}

export function P({ children, style, ...rest }: Props) {
  return <Text {...rest} style={[theme.text.body, { color: theme.color.text }, style]}>{children}</Text>;
}

export function Muted({ children, style, ...rest }: Props) {
  return <Text {...rest} style={[theme.text.body, { color: theme.color.muted }, style]}>{children}</Text>;
}

export function Small({ children, style, ...rest }: Props) {
  return <Text {...rest} style={[theme.text.small, { color: theme.color.muted }, style]}>{children}</Text>;
}
