import { useRouter, Stack } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { theme } from '@/src/ui/theme';

function HeaderChip({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: danger ? 'rgba(239,68,68,0.16)' : 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: danger ? 'rgba(239,68,68,0.35)' : theme.color.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          color: danger ? theme.color.danger : theme.color.text,
          fontWeight: '900',
          fontSize: 12,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AppLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerStyle: {
          backgroundColor: theme.color.bg,
        },
        headerShadowVisible: false,
        headerTintColor: theme.color.text,
        headerTitleStyle: {
          color: theme.color.text,
          fontWeight: '900',
        },
        contentStyle: {
          backgroundColor: theme.color.bg,
        },

        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <HeaderChip label="Profil" onPress={() => router.push('/(app)/profile')} />

            <HeaderChip
              label="Logout"
              danger
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
            />
          </View>
        ),
      }}
    />
  );
}
