import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Weben a teljes URL-ből cserél sessiont
    const url = typeof window !== 'undefined' ? window.location.href : null;

    (async () => {
      if (url) {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (!error) {
          router.replace('/(app)');
          return;
        }
        console.warn('exchangeCodeForSession error:', error.message);
      }
      router.replace('/(auth)/sign-in');
    })();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text>Bejelentkezés folyamatban…</Text>
    </View>
  );
}
