import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import type { Session } from '@supabase/supabase-js';

function useAuthRedirect(session: Session | null, initialized: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) router.replace('/(auth)/sign-in');
    if (session && inAuthGroup) router.replace('/(app)');
  }, [session, initialized, segments, router]);
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setInitialized(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setInitialized(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useAuthRedirect(session, initialized);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/sign-in" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
