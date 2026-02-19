import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { H1, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Ismeretlen hiba');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    color: theme.color.text,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    fontWeight: '700' as const,
  };

  return (
    <Screen scroll>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ gap: theme.space.lg }}>
          <View style={{ gap: 6, alignItems: 'center' }}>
            <H1>Belépés</H1>
            <Muted>Jelentkezz be a folytatáshoz.</Muted>
          </View>

          <Card>
            <View style={{ gap: theme.space.md }}>
              <View style={{ gap: theme.space.sm }}>
                <Small>Email</Small>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={theme.color.subtle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={inputStyle}
                />
              </View>

              <View style={{ gap: theme.space.sm }}>
                <Small>Jelszó</Small>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Jelszó"
                  placeholderTextColor={theme.color.subtle}
                  secureTextEntry
                  autoCapitalize="none"
                  style={inputStyle}
                />
              </View>

              <Button
                title={loading ? 'Belépek…' : 'Belépés'}
                onPress={signIn}
                disabled={loading}
              />

              <Link href={{ pathname: '/(auth)/sign-up' as any }} asChild>
                <Button title="Nincs fiókod? Regisztráció →" variant="ghost" />
              </Link>
            </View>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
