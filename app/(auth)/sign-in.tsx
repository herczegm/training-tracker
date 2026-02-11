import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';

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

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: '700' }}>Belépés</Text>

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
        placeholder="Jelszó"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 10 }}
      />

      <Pressable
        onPress={signIn}
        disabled={loading}
        style={{ backgroundColor: loading ? '#999' : '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {loading ? 'Belépek…' : 'Belépés'}
        </Text>
      </Pressable>

      <Link href={{ pathname: '/(auth)/sign-up' as any }} style={{ color: '#444' }}>
        Nincs fiókod? Regisztráció →
      </Link>
    </View>
  );
}
