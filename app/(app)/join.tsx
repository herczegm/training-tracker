import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { redeemInvite } from '../../src/db/invites';
import { useRouter } from 'expo-router';

export default function JoinTeamScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const join = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;

    try {
      setLoading(true);
      const res = await redeemInvite(c);
      Alert.alert('Siker', 'Csatlakoztál a csapathoz.');
      router.replace({ pathname: '/(app)/team/[teamId]', params: { teamId: res.team_id } });
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült csatlakozni');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Csatlakozás kóddal</Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Pl.: 8H7K3QWZ"
        autoCapitalize="characters"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 10 }}
      />

      <Pressable
        onPress={join}
        disabled={loading}
        style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
      >
        {loading ? <ActivityIndicator /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Csatlakozom</Text>}
      </Pressable>
    </View>
  );
}
