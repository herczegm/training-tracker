import { Link } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { supabase } from '../../src/lib/supabase';

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
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: '700' }}>Regisztráció</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 10 }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Jelszó (min. 8 karakter)"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 10 }}
      />

      <Pressable
        onPress={signUp}
        disabled={loading}
        style={{ backgroundColor: loading ? '#999' : '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {loading ? 'Létrehozom…' : 'Fiók létrehozása'}
        </Text>
      </Pressable>

      <Link href="/(auth)/sign-in" style={{ color: '#444' }}>
        Van már fiókod? Belépés →
      </Link>
    </View>
  );
}
