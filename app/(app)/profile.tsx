import { useEffect, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';

import { getMyProfile, updateMyDisplayName } from '../../src/db/profile';
import { supabase } from '../../src/lib/supabase';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H3, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const profile = await getMyProfile();
      setDisplayName(profile?.display_name ?? '');
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni a profilt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const clean = displayName.trim();
    if (clean.length < 2) {
      Alert.alert('Név', 'Adj meg legalább 2 karaktert.');
      return;
    }
    try {
      setSaving(true);
      await updateMyDisplayName(clean);
      Alert.alert('Mentve', 'Frissítettem a neved.');
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült menteni');
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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

  if (loading) {
    return (
      <Screen>
        <LoadingView label="Profil betöltése..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        <View style={{ gap: 6 }}>
          <H1>Profil</H1>
          <Muted>Itt tudod beállítani a megjelenített nevedet.</Muted>
        </View>

        <Card>
          <View style={{ gap: theme.space.md }}>
            <View style={{ gap: theme.space.sm }}>
              <H3>Megjelenített név</H3>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Pl. Kovács Bence"
                placeholderTextColor={theme.color.subtle}
                autoCapitalize="words"
                autoCorrect={false}
                style={inputStyle}
              />
              <Small>Legalább 2 karakter.</Small>
            </View>

            <Button title={saving ? 'Mentés…' : 'Mentés'} onPress={save} disabled={saving} />

            <Button title="Kijelentkezés" variant="secondary" onPress={signOut} disabled={saving} />
          </View>
        </Card>
      </View>
    </Screen>
  );
}
