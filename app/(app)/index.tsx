import { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { listMyTeams } from '../../src/db/teams';
import { devCreateOrgAndTeam } from '../../src/db/bootstrap';
import type { Team } from '../../src/db/types';

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const [orgName, setOrgName] = useState('Demo Club');
  const [teamName, setTeamName] = useState('U15');

  const load = async () => {
    try {
      setLoading(true);
      const t = await listMyTeams();
      setTeams(t);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült lekérni a csapatokat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      setLoading(true);
      const res = await devCreateOrgAndTeam({ orgName: orgName.trim(), teamName: teamName.trim() });
      setTeams(res.teams);
      Alert.alert('Kész', `Létrejött: ${res.team.name}`);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült létrehozni');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Saját csapatok</Text>

      <View style={{ gap: 8, padding: 12, borderWidth: 1, borderRadius: 12 }}>
        <Text style={{ fontWeight: '700' }}>DEV: Org + Team létrehozás</Text>

        <TextInput
          value={orgName}
          onChangeText={setOrgName}
          placeholder="Org név"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10 }}
        />
        <TextInput
          value={teamName}
          onChangeText={setTeamName}
          placeholder="Team név"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10 }}
        />

        <Pressable
          onPress={create}
          disabled={loading}
          style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Létrehozás</Text>
        </Pressable>

        <Pressable onPress={load} disabled={loading} style={{ padding: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '600' }}>Frissítés</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : teams.length === 0 ? (
        <Text style={{ color: '#666' }}>Még nincs csapatod. Hozz létre egyet fent.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {teams.map((t) => (
            <Link key={t.id} href={{ pathname: '/(app)/team/[teamId]', params: { teamId: t.id } }} asChild>
              <Pressable style={{ padding: 14, borderWidth: 1, borderRadius: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '700' }}>{t.name}</Text>
                {!!t.age_group && <Text style={{ color: '#666' }}>{t.age_group}</Text>}
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </View>
  );
}
