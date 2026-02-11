import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { createInvite, listInvites, setInviteDisabled, type InviteRow } from '../../../../src/db/invites';

export default function InvitesScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InviteRow[]>([]);

  const [role, setRole] = useState<'player' | 'coach'>('player');
  const [maxUses, setMaxUses] = useState('0'); // 0=unlimited
  const [expiresHours, setExpiresHours] = useState('0'); // 0 = never

  const expiresAt = useMemo(() => {
    const h = Number(expiresHours);
    if (!h || h <= 0) return null;
    return new Date(Date.now() + h * 3600 * 1000).toISOString();
  }, [expiresHours]);

  const load = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const res = await listInvites(teamId);
      setItems(res);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni az invite-okat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  const generate = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const inv = await createInvite({
        teamId,
        role,
        maxUses: Math.max(0, Number(maxUses) || 0),
        expiresAt,
      });
      Alert.alert('Új kód', inv.code);
      await load();
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült létrehozni');
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (inv: InviteRow) => {
    try {
      setLoading(true);
      await setInviteDisabled(inv.id, !inv.disabled);
      await load();
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült módosítani');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Invite kódok</Text>

      <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 8 }}>
        <Text style={{ fontWeight: '800' }}>Új invite</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => setRole('player')}
            style={{
              padding: 10,
              borderWidth: 1,
              borderRadius: 10,
              backgroundColor: role === 'player' ? '#000' : 'transparent',
            }}
          >
            <Text style={{ color: role === 'player' ? '#fff' : '#000', fontWeight: '700' }}>Player</Text>
          </Pressable>

          <Pressable
            onPress={() => setRole('coach')}
            style={{
              padding: 10,
              borderWidth: 1,
              borderRadius: 10,
              backgroundColor: role === 'coach' ? '#000' : 'transparent',
            }}
          >
            <Text style={{ color: role === 'coach' ? '#fff' : '#000', fontWeight: '700' }}>Coach</Text>
          </Pressable>
        </View>

        <TextInput
          value={maxUses}
          onChangeText={setMaxUses}
          placeholder="Max uses (0 = unlimited)"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10 }}
        />

        <TextInput
          value={expiresHours}
          onChangeText={setExpiresHours}
          placeholder="Expires in hours (0 = never)"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10 }}
        />

        <Pressable
          onPress={generate}
          disabled={loading}
          style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Kód generálás</Text>
        </Pressable>

        <Pressable onPress={load} disabled={loading} style={{ padding: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700' }}>Frissítés</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : items.length === 0 ? (
        <Text style={{ color: '#666' }}>Nincs invite.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {items.map((inv) => (
            <View key={inv.id} style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 4 }}>
              <Text style={{ fontWeight: '900', fontSize: 18 }}>{inv.code}</Text>
              <Text style={{ color: '#666' }}>Role: {inv.role}</Text>
              <Text style={{ color: '#666' }}>
                Uses: {inv.uses}/{inv.max_uses === 0 ? '∞' : inv.max_uses}
              </Text>
              <Text style={{ color: '#666' }}>
                Expires: {inv.expires_at ? new Date(inv.expires_at).toLocaleString() : 'never'}
              </Text>
              <Text style={{ color: inv.disabled ? '#b00' : '#060', fontWeight: '700' }}>
                {inv.disabled ? 'Disabled' : 'Active'}
              </Text>

              <Pressable
                onPress={() => toggle(inv)}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '700' }}>{inv.disabled ? 'Engedélyezés' : 'Tiltás'}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
