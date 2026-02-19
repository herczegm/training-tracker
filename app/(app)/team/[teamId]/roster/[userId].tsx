import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';

import { getMyRole } from '../../../../../src/db/roles';
import {
  listTeamRoster,
  upsertTeamPlayerProfile,
  replaceTeamPlayerPositions,
  type TeamRosterRow,
} from '../../../../../src/db/roster';
import { listTeamKits, type TeamKit } from '../../../../../src/db/kits';
import { setKitNumber, clearKitNumber, getKitNumber } from '../../../../../src/db/kitNumbers';
import { listPositions, type PositionRow } from '../../../../../src/db/positions';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H2, H3, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function RosterPlayerEdit() {
  const { teamId, userId } = useLocalSearchParams<{ teamId: string; userId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);

  const [player, setPlayer] = useState<TeamRosterRow | null>(null);

  const [preferredNumber, setPreferredNumber] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [note, setNote] = useState<string>('');

  const [kits, setKits] = useState<TeamKit[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [kitNumber, setKitNumberState] = useState<string>('');

  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [selectedPosIds, setSelectedPosIds] = useState<number[]>([]);

  const canEdit = role === 'admin' || role === 'coach';

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    color: theme.color.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    fontSize: 14,
    fontWeight: '600' as const,
  };

  const chipStyle = (on: boolean) => ({
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: on ? 'transparent' : theme.color.border,
    borderRadius: theme.radius.pill,
    backgroundColor: on ? theme.color.text : 'transparent',
  });

  const chipText = (on: boolean) => ({
    color: on ? theme.color.bg : theme.color.text,
    fontWeight: '900' as const,
  });

  const validateNumber = (raw: string, label: string) => {
    const t = raw.trim();
    if (t === '') return { ok: true as const, value: null as number | null };
    const n = Number(t);
    if (Number.isNaN(n) || n < 0 || n > 999) {
      Alert.alert('Hiba', `${label} nem valid.`);
      return { ok: false as const, value: null as number | null };
    }
    return { ok: true as const, value: n };
  };

  const load = async () => {
    if (!teamId || !userId) return;
    try {
      setLoading(true);

      const r = await getMyRole(teamId);
      setRole(r);

      if (!(r === 'admin' || r === 'coach')) {
        Alert.alert('Nincs jogosultság', 'Csak coach/admin szerkeszthet roster adatot.');
        router.back();
        return;
      }

      const roster = await listTeamRoster(teamId);
      const row = roster.find((x) => x.user_id === userId) ?? null;
      if (!row) {
        setPlayer(null);
        return;
      }
      setPlayer(row);

      setPreferredNumber(row?.jersey_number != null ? String(row.jersey_number) : '');
      setIsActive(row?.is_active !== false);
      setNote(row?.note ?? '');

      const k = await listTeamKits(teamId);
      setKits(k);
      const defaultKit = k.find((x) => x.is_default) ?? k[0] ?? null;
      const dkId = defaultKit?.id ?? null;
      setSelectedKitId(dkId);

      if (dkId) {
        const num = await getKitNumber({ teamId, kitId: dkId, userId });
        setKitNumberState(num == null ? '' : String(num));
      } else {
        setKitNumberState('');
      }

      const teamSport = row?.team_sport ?? 'soccer';
      const ps1 = await listPositions(teamSport);
      const ps2 = teamSport === 'generic' ? [] : await listPositions('generic');
      setPositions([...ps1, ...ps2]);

      const sel = (row?.positions ?? []).map((p) => p.id);
      setSelectedPosIds(sel);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId, userId]);

  useEffect(() => {
    const run = async () => {
      if (!teamId || !userId || !selectedKitId) return;
      try {
        const num = await getKitNumber({ teamId, kitId: selectedKitId, userId });
        setKitNumberState(num == null ? '' : String(num));
      } catch (e: any) {
        Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni a kit mezszámot');
      }
    };
    run();
  }, [teamId, userId, selectedKitId]);

  const togglePos = (id: number) => {
    setSelectedPosIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = async () => {
    if (!teamId || !userId) return;
    try {
      setSaving(true);

      const prefCheck = validateNumber(preferredNumber, 'A preferred mezszám');
      if (!prefCheck.ok) return;

      await upsertTeamPlayerProfile({
        teamId,
        userId,
        jerseyNumber: prefCheck.value,
        isActive,
        note: note.trim() || null,
      });

      await replaceTeamPlayerPositions({
        teamId,
        userId,
        positionIds: selectedPosIds,
        priorities: selectedPosIds.map((_, i) => i + 1),
      });

      if (selectedKitId) {
        const kitCheck = validateNumber(kitNumber, 'A kit mezszám');
        if (!kitCheck.ok) return;

        if (kitCheck.value == null) {
          await clearKitNumber({ teamId, kitId: selectedKitId, userId });
        } else {
          await setKitNumber({ teamId, kitId: selectedKitId, userId, jerseyNumber: kitCheck.value });
        }
      }

      Alert.alert('Kész', 'Mentve.');
      router.back();
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült menteni');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingView label="Játékos betöltése..." />
      </Screen>
    );
  }

  if (!player) {
    return (
      <Screen scroll>
        <EmptyState title="Nem találom a játékost" description="Nincs benne a rosterben vagy hibás az útvonal." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        {/* Header */}
        <View style={{ gap: 6 }}>
          <H1>{player.display_name ?? player.user_id}</H1>
          <Muted>{player.user_id}</Muted>
        </View>

        {/* Profil */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <H2>Profil</H2>

            <View style={{ gap: theme.space.sm }}>
              <Small>Preferred mezszám</Small>
              <TextInput
                value={preferredNumber}
                onChangeText={setPreferredNumber}
                keyboardType="numeric"
                placeholder="pl. 10"
                placeholderTextColor={theme.color.subtle}
                style={inputStyle}
              />
            </View>

            <Pressable
              onPress={() => setIsActive((v) => !v)}
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: theme.color.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.color.surface,
              }}
            >
              <H3>{isActive ? 'Aktív: igen' : 'Aktív: nem'}</H3>
              <Muted style={{ marginTop: 2 }}>
                {isActive ? 'A játékos szerepel a rosterben.' : 'A játékos el van rejtve/inaktív.'}
              </Muted>
            </Pressable>

            <View style={{ gap: theme.space.sm }}>
              <Small>Megjegyzés</Small>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="opcionális"
                placeholderTextColor={theme.color.subtle}
                multiline
                style={[inputStyle, { minHeight: 90, textAlignVertical: 'top' as const }]}
              />
            </View>
          </View>
        </Card>

        {/* Kit */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <H2>Mezszám (kit szerint)</H2>

            {kits.length === 0 ? (
              <EmptyState title="Nincs kit" description="Adj hozzá legalább egy kitet, hogy kit-enkénti mezszám legyen." />
            ) : (
              <>
                <View style={{ gap: theme.space.sm }}>
                  <Small>Kit kiválasztása</Small>
                  <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                    {kits.map((k) => {
                      const on = selectedKitId === k.id;
                      return (
                        <Pressable key={k.id} onPress={() => setSelectedKitId(k.id)} style={chipStyle(on)}>
                          <Small style={chipText(on)}>
                            {k.name}
                            {k.is_default ? ' (default)' : ''}
                          </Small>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={{ gap: theme.space.sm }}>
                  <Small>Kit mezszám</Small>
                  <TextInput
                    value={kitNumber}
                    onChangeText={setKitNumberState}
                    keyboardType="numeric"
                    placeholder="pl. 18 (üres = törlés)"
                    placeholderTextColor={theme.color.subtle}
                    style={inputStyle}
                  />
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Posztok */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <H2>Posztok</H2>

            {positions.length === 0 ? (
              <EmptyState title="Nincs pozíció" description="Nincs pozíció a csapat sportjához." />
            ) : (
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {positions.map((p) => {
                  const on = selectedPosIds.includes(p.id);
                  return (
                    <Pressable key={p.id} onPress={() => togglePos(p.id)} style={chipStyle(on)}>
                      <Small style={chipText(on)}>{p.code}</Small>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {positions.length > 0 && <Muted>Prioritás: a kiválasztás sorrendjében mentjük.</Muted>}
          </View>
        </Card>

        {/* Mentés */}
        <Card>
          <View style={{ gap: theme.space.sm }}>
            <H3>Mentés</H3>
            <Button
              title={saving ? 'Mentés…' : 'Mentés'}
              onPress={save}
              disabled={!canEdit || saving}
              variant="primary"
            />
            <Muted>Csak coach/admin menthet.</Muted>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
