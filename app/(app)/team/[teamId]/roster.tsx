import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { getMyRole } from '../../../../src/db/roles';
import { listTeamRoster, type TeamRosterRow } from '../../../../src/db/roster';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { ListItem } from '@/src/ui/ListItem';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H2, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function TeamRosterScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();

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

  const items = useMemo(() => {
    return rows.map((p) => {
      const title = `${p.display_name ?? p.user_id}${p.role !== 'player' ? ` (${p.role})` : ''}`;

      const jersey = p.jersey_number != null ? `#${p.jersey_number}` : '—';
      const active = p.is_active === false ? 'inaktív' : 'aktív';
      const pos = p.positions?.length ? p.positions.map((x) => x.code).join(', ') : '—';

      const subtitle = `Mezszám: ${jersey} • ${active} • Posztok: ${pos}`;

      const editable = canEdit && p.role === 'player';

      return (
        <ListItem
          key={p.user_id}
          title={title}
          subtitle={subtitle}
          leftIcon={p.role === 'coach' || p.role === 'admin' ? '🧠' : '👤'}
          chevron={editable}
          rightText={p.is_active === false ? 'OFF' : undefined}
          onPress={
            editable
              ? () =>
                  router.push({
                    pathname: '/(app)/team/[teamId]/roster/[userId]',
                    params: { teamId, userId: p.user_id },
                  })
              : undefined
          }
        />
      );
    });
  }, [rows, canEdit, router, teamId]);

  if (loading && rows.length === 0) {
    return (
      <Screen>
        <LoadingView label="Roster betöltése..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        <View style={{ gap: 6 }}>
          <H1>Roster</H1>
          <Muted>{canEdit ? 'Játékosok és adataik (coach/admin szerkeszthet).' : 'Játékosok és adataik.'}</Muted>
        </View>

        <Card>
          <View style={{ gap: theme.space.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <H2>Lista</H2>
              <Small>{rows.length} fő</Small>
            </View>

            <Button title="Frissítés" onPress={load} disabled={loading} variant="secondary" />
          </View>
        </Card>

        <Card>
          <View style={{ gap: theme.space.md }}>
            {loading ? (
              <LoadingView label="Frissítés..." />
            ) : rows.length === 0 ? (
              <EmptyState title="Nincs adat" description="Ehhez a csapathoz még nincs roster beállítva." />
            ) : (
              <View style={{ gap: 10 }}>{items}</View>
            )}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
