import { useRouter, Stack } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function AppLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Pressable onPress={() => router.push('/(app)/profile')} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ fontWeight: '700' }}>Profil</Text>
            </Pressable>
            
            <Pressable
              onPress={async () => {
                const res = await new Promise<boolean>((resolve) => {
                  Alert.alert('Kijelentkezés', 'Biztosan kijelentkezel?', [
                    { text: 'Mégse', style: 'cancel', onPress: () => resolve(false) },
                    { text: 'Kilépek', style: 'destructive', onPress: () => resolve(true) },
                  ]);
                });

                if (!res) return;
                await supabase.auth.signOut();
              }}
              style={{ paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Text style={{ fontWeight: '700' }}>Logout</Text>
            </Pressable>
          </View>
        ),
      }}
    />
  );
}
