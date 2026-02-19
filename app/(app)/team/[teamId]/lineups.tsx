import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import {
  createLineupFromTemplate,
  listTeamLineups,
  listTemplates,
  type LineupRow,
  type TemplateRow,
} from '../../../../src/db/lineups';
import { getMyRole } from '../../../../src/db/roles';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { ListItem } from '@/src/ui/ListItem';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H2, H3, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function TeamLineupsScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);

  const [items, setItems] = useState<LineupRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const canCoach = role === 'admin' || role === 'coach';

  const load = async () => {
    if (!teamId) return;
    try {
      setLoading(true);

      const r = await getMyRole(teamId);
      setRole(r);

      const rows = await listTeamLineups(teamId);
      setItems(rows);

      if (r === 'admin' || r === 'coach') {
        const tpls = await listTemplates('generic'); // később team.sport alapján
        setTemplates(tpls);
        setSelectedTemplateId(tpls[0]?.id ?? null);
      } else {
        setTemplates([]);
        setSelectedTemplateId(null);
      }
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  const create = async () => {
    if (!teamId || !selectedTemplateId) return;
    try {
      setLoading(true);

      await createLineupFromTemplate({
        teamId,
        templateId: selectedTemplateId,
        eventId: null,
        formation: null,
      });

      await load();
      Alert.alert('Kész', 'Lineup létrejött.');
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült létrehozni');
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <Screen>
        <LoadingView label="Lineupok betöltése..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        {/* Header */}
        <View style={{ gap: 6 }}>
          <H1>Lineupok</H1>
          <Muted>Team szintű összeállítások. (Event lineupok külön az eseménynél.)</Muted>
        </View>

        {/* Create block */}
        {canCoach && (
          <Card>
            <View style={{ gap: theme.space.md }}>
              <View style={{ gap: 4 }}>
                <H2>Új team lineup</H2>
                <Small>Template alapján létrehozás</Small>
              </View>

              {templates.length === 0 ? (
                <EmptyState
                  title="Nincs template"
                  description="Hozz létre egy lineup template-et (lineup_templates + lineup_template_slots)."
                  // actionLabel="Frissítés"
                  // onAction={load}
                />
              ) : (
                <>
                  {/* Template chips */}
                  <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                    {templates.map((t) => {
                      const active = selectedTemplateId === t.id;
                      return (
                        <Button
                          key={t.id}
                          title={t.name}
                          onPress={() => setSelectedTemplateId(t.id)}
                          variant={active ? 'primary' : 'secondary'}
                          disabled={loading}
                        />
                      );
                    })}
                  </View>

                  <Button
                    title={loading ? 'Létrehozás…' : 'Lineup létrehozása'}
                    onPress={create}
                    disabled={loading || !selectedTemplateId}
                    variant="primary"
                  />
                </>
              )}

              <Button
                title={loading ? 'Frissítés…' : 'Frissítés'}
                onPress={load}
                disabled={loading}
                variant="ghost"
              />
            </View>
          </Card>
        )}

        {/* List */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <H2>Lista</H2>
              <Small>{items.length} db</Small>
            </View>

            {loading ? (
              <LoadingView label="Frissítés..." />
            ) : items.length === 0 ? (
              <EmptyState
                title="Még nincs lineup"
                description={canCoach ? 'Hozz létre egyet fent template-ből.' : 'Coach/Admin tud létrehozni.'}
              />
            ) : (
              <View style={{ gap: 10 }}>
                {items.map((l) => {
                  const title = l.event_id ? 'Meccs lineup' : 'Team lineup';
                  const subtitle = `Létrehozva: ${new Date(l.created_at).toLocaleString()}`;

                  return (
                    <Link
                      key={l.id}
                      href={{ pathname: '/(app)/team/[teamId]/lineup/[lineupId]', params: { teamId, lineupId: l.id } }}
                      asChild
                    >
                      <ListItem
                        title={title}
                        subtitle={subtitle}
                        chevron
                        rightBadge={l.locked_at ? 'LOCKED' : undefined}
                      />
                    </Link>
                  );
                })}
              </View>
            )}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
