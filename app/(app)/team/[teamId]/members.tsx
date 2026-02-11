import { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { listTeamMembers, type MemberWithProfile } from '../../../../src/db/members';

export default function TeamMembersScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await listTeamMembers(teamId);
        setMembers(res);
      } catch (e: any) {
        Alert.alert('Hiba', e?.message ?? 'Nem sikerült lekérni a tagokat');
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId]);

  return (
    <View style={{ flex: 1, padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Csapattagok</Text>

      {loading ? (
        <ActivityIndicator />
      ) : members.length === 0 ? (
        <Text style={{ color: '#666' }}>Nincs tag.</Text>
      ) : (
        members.map((m) => (
          <View key={m.user_id} style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
            <Text style={{ fontWeight: '800' }}>{m.display_name ?? m.user_id}</Text>
            <Text style={{ color: '#666' }}>Role: {m.role}</Text>
          </View>
        ))
      )}
    </View>
  );
}
