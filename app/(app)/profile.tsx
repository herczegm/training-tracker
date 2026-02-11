import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { getMyProfile, updateMyDisplayName } from '../../src/db/profile';
import { supabase } from '../../src/lib/supabase';

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

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Profil</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={{ fontWeight: '700' }}>Megjelenített név</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Pl. Kovács Bence"
            style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 10 }}
          />

          <Pressable
            onPress={save}
            disabled={saving}
            style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Mentés…' : 'Mentés'}</Text>
          </Pressable>

          <Pressable
            onPress={signOut}
            style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
          >
            <Text style={{ fontWeight: '700' }}>Logout</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
