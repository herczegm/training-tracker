import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import { createInvite } from '../../../src/db/invites';
import type { Team } from '../../../src/db/types';
import { getMyRole } from '@/src/db/roles';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { ListItem } from '@/src/ui/ListItem';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H2, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function TeamHome() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const [inviteLoading, setInviteLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);
  const canCoach = role === 'admin' || role === 'coach';

  const load = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single();
      if (error) throw error;

      setTeam(data as Team);
      setRole((await getMyRole(teamId)) ?? null);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni a csapatot');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  const genInvite = async () => {
    if (!teamId) return;
    try {
      setInviteLoading(true);
      const inv = await createInvite({ teamId, role: 'player', maxUses: 0 }); // unlimited
      setLastCode(inv.code);
      Alert.alert('Invite kód', inv.code);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült invite-ot létrehozni');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading && !team) {
    return (
      <Screen>
        <LoadingView label="Csapat betöltése..." />
      </Screen>
    );
  }

  if (!team) {
    return (
      <Screen scroll>
        <EmptyState
          title="Nem találom a csapatot"
          description="Lehet, hogy törölve lett, vagy nincs jogosultságod hozzá."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        {/* HEADER */}
        <View style={{ gap: 6 }}>
          <H1>{team.name ?? 'Csapat'}</H1>
          <Muted>
            Szerepkör: <Small>{role ?? '—'}</Small>
          </Muted>

          {!!lastCode && (
            <Card>
              <View style={{ gap: 6 }}>
                <H2>Legutóbbi invite</H2>
                <Muted>Másold ki és küldd el a játékosnak:</Muted>
                <View style={{ paddingTop: 4 }}>
                  <H1>{lastCode}</H1>
                </View>
              </View>
            </Card>
          )}
        </View>

        {/* COACH TOOLS */}
        {canCoach && (
          <Card>
            <View style={{ gap: theme.space.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <H2>Coach / Admin</H2>
                <Small>{inviteLoading ? 'dolgozom…' : 'eszközök'}</Small>
              </View>

              <Button
                title={inviteLoading ? 'Készül…' : 'Invite kód generálás (játékos)'}
                onPress={genInvite}
                disabled={inviteLoading}
                variant="primary"
              />

              <ListItem
                title="Invite kezelő"
                subtitle="Kódok listája, letiltás/engedélyezés"
                leftIcon="🎟️"
                onPress={() =>
                  router.push({ pathname: '/(app)/team/[teamId]/invites', params: { teamId } })
                }
              />
            </View>
          </Card>
        )}

        {/* MAIN NAV */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <H2>Menü</H2>

            <ListItem
              title="Események"
              subtitle="Edzések, meccsek, részletek"
              leftIcon="📅"
              onPress={() =>
                router.push({ pathname: '/(app)/team/[teamId]/events', params: { teamId } })
              }
            />

            <ListItem
              title="Csapattagok"
              subtitle="Tagok és szerepkörök"
              leftIcon="👥"
              onPress={() =>
                router.push({ pathname: '/(app)/team/[teamId]/members', params: { teamId } })
              }
            />

            <ListItem
              title="Lineupok"
              subtitle="Team lineupok, sablonokból"
              leftIcon="🧩"
              onPress={() =>
                router.push({ pathname: '/(app)/team/[teamId]/lineups', params: { teamId } })
              }
            />

            <ListItem
              title="Roster"
              subtitle="Mezszámok, posztok, aktív státusz"
              leftIcon="📋"
              onPress={() =>
                router.push({ pathname: '/(app)/team/[teamId]/roster', params: { teamId } })
              }
            />
          </View>
        </Card>

        {/* JOIN */}
        <Card>
          <View style={{ gap: theme.space.sm }}>
            <H2>Csatlakozás</H2>
            <Muted>Ha másik csapathoz csatlakoznál invite kóddal.</Muted>

            <Button
              title="Csatlakozás kóddal"
              variant="secondary"
              onPress={() => router.push('/(app)/join')}
            />
          </View>
        </Card>
      </View>
    </Screen>
  );
}
