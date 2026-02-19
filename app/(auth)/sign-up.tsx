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

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (password.length < 8) {
      Alert.alert('Jelszó', 'Legyen legalább 8 karakter.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;

      Alert.alert(
        'Kész!',
        'Ha be van kapcsolva az email megerősítés, nézd meg a leveleidet. Ha nincs, azonnal be tudsz lépni.'
      );
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Ismeretlen hiba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ flex: 1, justifyContent: 'center', gap: theme.space.lg }}>
        <View style={{ gap: 6 }}>
          <H1>Regisztráció</H1>
          <Muted>Hozz létre fiókot és csatlakozz a csapatodhoz.</Muted>
        </View>

        <Card>
          <View style={{ gap: theme.space.md }}>
            <View style={{ gap: 8 }}>
              <Small>Email</Small>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={theme.color.subtle}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: theme.color.text,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: theme.radius.md,
                  fontWeight: '700',
                }}
              />
            </View>

            <View style={{ gap: 8 }}>
              <Small>Jelszó</Small>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 karakter"
                placeholderTextColor={theme.color.subtle}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: theme.color.text,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: theme.radius.md,
                  fontWeight: '700',
                }}
              />
              <Muted>
                Tipp: használj legalább 8 karaktert, számot és egy speciális jelet.
              </Muted>
            </View>

            <Button
              title={loading ? 'Létrehozom…' : 'Fiók létrehozása'}
              onPress={signUp}
              disabled={loading}
              variant="primary"
            />

            <Link href="/(auth)/sign-in" asChild>
              <Button title="Van már fiókod? Belépés →" onPress={() => {}} variant="ghost" />
            </Link>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
