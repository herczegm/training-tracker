import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import {
    createLineupFromTemplate,
    listTeamLineups,
    listTemplates,
    type LineupRow,
    type TemplateRow,
} from '../../../../src/db/lineups';
import { getMyRole } from '../../../../src/db/roles';

export default function TeamLineupsScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);

  const [items, setItems] = useState<LineupRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const load = async () => {
    if (!teamId) return;
    try {
      setLoading(true);

      const r = await getMyRole(teamId);
      setRole(r);

      const rows = await listTeamLineups(teamId);
      setItems(rows);

      // templatek csak coach/adminnak kellenek (create-hoz)
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
        eventId: null, // team-level lineup
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

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Lineupok</Text>

      {(role === 'admin' || role === 'coach') && (
        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 10 }}>
          <Text style={{ fontWeight: '900' }}>Új lineup (team)</Text>

          {templates.length === 0 ? (
            <Text style={{ color: '#666' }}>Nincs template (lineup_templates).</Text>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {templates.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => setSelectedTemplateId(t.id)}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      backgroundColor: selectedTemplateId === t.id ? '#000' : 'transparent',
                    }}
                  >
                    <Text style={{ color: selectedTemplateId === t.id ? '#fff' : '#000', fontWeight: '700' }}>
                      {t.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={create}
                disabled={loading || !selectedTemplateId}
                style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Lineup létrehozása</Text>
              </Pressable>
            </>
          )}

          <Pressable onPress={load} disabled={loading} style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ fontWeight: '700' }}>Frissítés</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <ActivityIndicator />
      ) : items.length === 0 ? (
        <Text style={{ color: '#666' }}>Még nincs lineup.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {items.map((l) => (
            <Link
              key={l.id}
              href={{ pathname: '/(app)/team/[teamId]/lineup/[lineupId]', params: { teamId, lineupId: l.id } }}
              asChild
            >
              <Pressable style={{ padding: 14, borderWidth: 1, borderRadius: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '900' }}>
                  {l.event_id ? 'Meccs lineup' : 'Team lineup'}
                </Text>
                <Text style={{ color: '#666' }}>{new Date(l.created_at).toLocaleString()}</Text>
                {!!l.locked_at && <Text style={{ color: '#b00', fontWeight: '800' }}>LOCKED</Text>}
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </View>
  );
}
