import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { getMyRole } from '../../../../src/db/roles';
import { listTeamRoster, type TeamRosterRow } from '../../../../src/db/roster';

export default function TeamRosterScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);
  const [rows, setRows] = useState<TeamRosterRow[]>([]);

  const canEdit = role === 'admin' || role === 'coach';

  const load = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const r = await getMyRole(teamId);
      setRole(r);
      const data = await listTeamRoster(teamId);
      setRows(data);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '900' }}>Roster</Text>

      <Pressable onPress={load} disabled={loading} style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}>
        <Text style={{ fontWeight: '800' }}>Frissítés</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator />
      ) : rows.length === 0 ? (
        <Text style={{ color: '#666' }}>Nincs adat.</Text>
      ) : (
        <View style={{ gap: 10 }}>
              {rows.map((p) => {
                const card = (
                  <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 6 }}>
                    <Text style={{ fontWeight: '900', fontSize: 16 }}>
                      {p.display_name ?? p.user_id} {p.role !== 'player' ? `(${p.role})` : ''}
                    </Text>

                    <Text style={{ color: '#444' }}>Mezszám: {p.jersey_number ?? '—'}</Text>
                    <Text style={{ color: '#444' }}>Aktív: {p.is_active === false ? 'nem' : 'igen'}</Text>

                    <Text style={{ color: '#444' }}>
                      Posztok:{' '}
                      {p.positions?.length ? p.positions.map((x) => x.code).join(', ') : '—'}
                    </Text>

                    {canEdit && p.role === 'player' && (
                      <Text style={{ color: '#666' }}>Kattints a szerkesztéshez</Text>
                    )}
                  </View>
                );

                if (canEdit && p.role === 'player') {
                  return (
                    <Link
                      key={p.user_id}
                      href={{ pathname: '/(app)/team/[teamId]/roster/[userId]', params: { teamId, userId: p.user_id } }}
                      asChild
                    >
                      <Pressable>{card}</Pressable>
                    </Link>
                  );
                }

                return <View key={p.user_id}>{card}</View>;
              })}
        </View>
      )}
    </View>
  );
}
