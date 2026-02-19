import { useEffect, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { Link } from 'expo-router';

import { listMyTeams } from '../../src/db/teams';
import { devCreateOrgAndTeam } from '../../src/db/bootstrap';
import type { Team } from '../../src/db/types';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { ListItem } from '@/src/ui/ListItem';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H2, H3, P, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

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

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    color: theme.color.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    fontWeight: '700' as const,
  };

  if (loading && teams.length === 0) {
    return (
      <Screen>
        <LoadingView label="Csapatok betöltése..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        {/* HEADER */}
        <View style={{ gap: 6 }}>
          <H1>Saját csapatok</H1>
          <Muted>Válassz csapatot, vagy hozz létre újat.</Muted>
        </View>

        {/* DEV CREATE */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <H3>DEV: Org + Team létrehozás</H3>

            <View style={{ gap: theme.space.sm }}>
              <Small>Org név</Small>
              <TextInput
                value={orgName}
                onChangeText={setOrgName}
                placeholder="Org név"
                placeholderTextColor={theme.color.subtle}
                style={inputStyle}
              />
            </View>

            <View style={{ gap: theme.space.sm }}>
              <Small>Team név</Small>
              <TextInput
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Team név"
                placeholderTextColor={theme.color.subtle}
                style={inputStyle}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Button title={loading ? 'Létrehozás…' : 'Létrehozás'} onPress={create} disabled={loading} />
              <Button title="Frissítés" variant="secondary" onPress={load} disabled={loading} />
            </View>

            <Small>Ez csak dev shortcut – később el lehet rejteni prod buildben.</Small>
          </View>
        </Card>

        {/* LIST */}
        {loading ? (
          <LoadingView label="Frissítés..." />
        ) : teams.length === 0 ? (
          <EmptyState
            title="Még nincs csapatod"
            description="Hozz létre egyet fent, vagy csatlakozz invite kóddal egy meglévőhöz."
          />
        ) : (
          <Card>
            <View style={{ gap: theme.space.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <H2>Csapatok</H2>
                <Small>{teams.length} db</Small>
              </View>

              <View style={{ gap: theme.space.sm }}>
                {teams.map((t) => (
                  <Link key={t.id} href={{ pathname: '/(app)/team/[teamId]', params: { teamId: t.id } }} asChild>
                    <View>
                      <ListItem
                        title={t.name}
                        subtitle={t.age_group ? t.age_group : '—'}
                        leftIcon="🏟️"
                        chevron
                      />
                    </View>
                  </Link>
                ))}
              </View>
            </View>
          </Card>
        )}
      </View>
    </Screen>
  );
}
