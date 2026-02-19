import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, View } from 'react-native';

import { getMyRole } from '../../../../../src/db/roles';
import { listTeamPeople, type TeamPerson } from '../../../../../src/db/teamPeople';
import {
  clearLineupSlot,
  getLineupById,
  listLineupSlotsLabeled,
  setLineupLocked,
  setLineupSlot,
  type LabeledLineupSlotRow,
  type LineupRow,
} from '../../../../../src/db/lineups';

// UI (a te rendszered)
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { ListItem } from '@/src/ui/ListItem';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';

import { H1, H2, H3, Muted, Small, P } from '@/src/ui/T';

export default function TeamLineupDetail() {
  const { teamId, lineupId } = useLocalSearchParams<{ teamId: string; lineupId: string }>();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);

  const [lineup, setLineup] = useState<LineupRow | null>(null);
  const [slots, setSlots] = useState<LabeledLineupSlotRow[]>([]);
  const [people, setPeople] = useState<TeamPerson[]>([]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlotKey, setActiveSlotKey] = useState<string | null>(null);

  const canCoach = role === 'admin' || role === 'coach';
  const canEdit = canCoach && !lineup?.locked_at;

  const peopleById = useMemo(() => {
    const m = new Map<string, TeamPerson>();
    for (const p of people) m.set(p.user_id, p);
    return m;
  }, [people]);

  const load = async () => {
    if (!teamId || !lineupId) return;
    try {
      setLoading(true);

      const r = await getMyRole(teamId);
      setRole(r);

      const l = await getLineupById(lineupId);
      setLineup(l);

      const s = await listLineupSlotsLabeled(lineupId);
      setSlots(s);

      const ppl = await listTeamPeople(teamId);
      setPeople(ppl);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId, lineupId]);

  const refreshSlots = async (id: string) => {
    const s = await listLineupSlotsLabeled(id);
    setSlots(s);
  };

  const openPicker = (slotKey: string) => {
    if (!canEdit) return;
    setActiveSlotKey(slotKey);
    setPickerOpen(true);
  };

  const choosePlayer = async (userId: string) => {
    if (!lineup || !activeSlotKey) return;
    try {
      setLoading(true);
      await setLineupSlot({ lineupId: lineup.id, slotKey: activeSlotKey, userId });
      await refreshSlots(lineup.id);
      setPickerOpen(false);
      setActiveSlotKey(null);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült menteni');
    } finally {
      setLoading(false);
    }
  };

  const clearSlot = async (slotKey: string) => {
    if (!lineup) return;
    try {
      setLoading(true);
      await clearLineupSlot(lineup.id, slotKey);
      await refreshSlots(lineup.id);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült törölni');
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async () => {
    if (!lineup) return;
    try {
      setLoading(true);
      await setLineupLocked(lineup.id, !lineup.locked_at);
      const fresh = await getLineupById(lineup.id);
      setLineup(fresh);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült lockolni');
    } finally {
      setLoading(false);
    }
  };

  // Loading / Not found
  if (loading && !lineup) {
    return (
      <Screen>
        <LoadingView label="Lineup betöltése..." />
      </Screen>
    );
  }

  if (!lineup) {
    return (
      <Screen>
        <EmptyState
          title="Nem találom a lineupot"
          description="Lehet, hogy törölve lett, vagy nincs jogosultságod hozzá."
        />
      </Screen>
    );
  }

  const title = lineup.event_id ? 'Meccs lineup' : 'Team lineup';

  return (
    <Screen scroll>
      <View style={{ gap: 12 }}>
        {/* Header */}
        <View style={{ gap: 6 }}>
          <H1>{title}</H1>
          {lineup.locked_at ? <Small>🔒 Zárolva</Small> : <Small>Szerkeszthető</Small>}
        </View>

        {/* Actions */}
        {canCoach && (
          <Card>
            <View style={{ gap: 10 }}>
              <H3>Műveletek</H3>

              <Button
                title={lineup.locked_at ? 'Unlock' : 'Lock'}
                onPress={toggleLock}
                disabled={loading}
                variant={lineup.locked_at ? 'danger' : 'secondary'}
              />

              <Muted>
                {lineup.locked_at
                  ? 'Zárolt lineupot nem lehet szerkeszteni.'
                  : 'Lockolás után a játékosok nem módosíthatók.'}
              </Muted>
            </View>
          </Card>
        )}

        {/* Slots */}
        <Card>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <H2>Slotok</H2>
              <Small>{slots.length} db</Small>
            </View>

            {slots.length === 0 ? (
              <EmptyState title="Nincsenek slotok" description="Valószínűleg hiányoznak a template slotok." />
            ) : (
              <View style={{ gap: 6 }}>
                {slots.map((s) => {
                  const displayName = s.user_id
                    ? (peopleById.get(s.user_id)?.display_name ?? s.user_id)
                    : null;

                  const subtitle = displayName ? `Játékos: ${displayName}` : 'Nincs kiválasztva';

                  return (
                    <ListItem
                      key={s.slot_key}
                      title={s.label}
                      subtitle={subtitle}
                      onPress={canEdit ? () => openPicker(s.slot_key) : undefined}
                      disabled={!canEdit}
                      chevron={canEdit}
                    />
                  );
                })}

                {!canEdit && (
                  <Muted>
                    {lineup.locked_at ? 'Ez a lineup zárolt.' : 'Nincs jogosultságod szerkeszteni.'}
                  </Muted>
                )}
              </View>
            )}
          </View>
        </Card>
      </View>

      {/* Picker Modal */}
      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}>
          {/* safe: wrapper a kerekítéshez */}
          <View style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}>
            <Card>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <H2>Válassz játékost</H2>
                  <Button title="Bezár" variant="ghost" onPress={() => setPickerOpen(false)} />
                </View>

                <FlatList
                  data={people}
                  keyExtractor={(p) => p.user_id}
                  renderItem={({ item }) => (
                    <ListItem
                      title={item.display_name ?? item.user_id}
                      subtitle={item.role}
                      onPress={() => choosePlayer(item.user_id)}
                      chevron
                    />
                  )}
                  style={{ maxHeight: 420 }}
                />

                {!!activeSlotKey && (
                  <Button
                    title="Slot ürítése"
                    variant="secondary"
                    disabled={!canEdit || loading}
                    onPress={async () => {
                      if (!activeSlotKey) return;
                      await clearSlot(activeSlotKey);
                      setPickerOpen(false);
                      setActiveSlotKey(null);
                    }}
                  />
                )}
              </View>
            </Card>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
