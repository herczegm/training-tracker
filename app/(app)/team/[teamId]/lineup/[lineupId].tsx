import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { getMyRole } from '../../../../../src/db/roles';
import { listTeamPeople, type TeamPerson } from '../../../../../src/db/teamPeople';
import {
  clearLineupSlot,
  getLineupById,
  listLineupSlotsLabeled,
  setLineupLocked,
  setLineupSlot,
  type LineupRow,
  type LineupSlotRow,
  type LabeledLineupSlotRow,
} from '../../../../../src/db/lineups';

export default function TeamLineupDetail() {
  const { teamId, lineupId } = useLocalSearchParams<{ teamId: string; lineupId: string }>();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);

  const [lineup, setLineup] = useState<LineupRow | null>(null);
  const [slots, setSlots] = useState<LabeledLineupSlotRow[]>([]);
  const [people, setPeople] = useState<TeamPerson[]>([]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlotKey, setActiveSlotKey] = useState<string | null>(null);

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

  const canEdit = (role === 'admin' || role === 'coach') && !lineup?.locked_at;

  const openPicker = (slotKey: string) => {
    setActiveSlotKey(slotKey);
    setPickerOpen(true);
  };

  const choosePlayer = async (userId: string) => {
    if (!lineup || !activeSlotKey) return;
    try {
      setLoading(true);
      await setLineupSlot({ lineupId: lineup.id, slotKey: activeSlotKey, userId });
      const s = await listLineupSlotsLabeled(lineup.id);
      setSlots(s);
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
      const s = await listLineupSlotsLabeled(lineup.id);
      setSlots(s);
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
      const l = await getLineupById(lineup.id);
      setLineup(l);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült lockolni');
      setLoading(false);
    }
  };

  if (loading && !lineup) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!lineup) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>Nem találom a lineupot.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '900' }}>{lineup.event_id ? 'Meccs lineup' : 'Team lineup'}</Text>
      {!!lineup.locked_at && <Text style={{ color: '#b00', fontWeight: '800' }}>LOCKED</Text>}

      {(role === 'admin' || role === 'coach') && (
        <Pressable
          onPress={toggleLock}
          disabled={loading}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ fontWeight: '800' }}>{lineup.locked_at ? 'Unlock' : 'Lock'}</Text>
        </Pressable>
      )}

      {slots.length === 0 ? (
        <Text style={{ color: '#666' }}>Nincsenek slotok.</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {slots.map((s) => {
            const name = s.user_id
              ? people.find((p) => p.user_id === s.user_id)?.display_name ?? s.user_id
              : '—';

            return (
              <View key={s.slot_key} style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 6 }}>
                <Text style={{ fontWeight: '900' }}>{s.label}</Text>
                <Text style={{ color: '#444' }}>Játékos: {name}</Text>

                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                  <Pressable
                    onPress={() => openPicker(s.slot_key)}
                    disabled={!canEdit}
                    style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
                  >
                    <Text style={{ fontWeight: '700' }}>{canEdit ? 'Kiválaszt' : 'Nem szerkeszthető'}</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => clearSlot(s.slot_key)}
                    disabled={!canEdit}
                    style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
                  >
                    <Text style={{ fontWeight: '700' }}>Clear</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            style={{
              backgroundColor: '#fff',
              padding: 16,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '70%',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '900', marginBottom: 10 }}>Válassz játékost</Text>

            <FlatList
              data={people}
              keyExtractor={(p) => p.user_id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => choosePlayer(item.user_id)}
                  style={{ padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 8 }}
                >
                  <Text style={{ fontWeight: '800' }}>{item.display_name ?? item.user_id}</Text>
                  <Text style={{ color: '#666' }}>{item.role}</Text>
                </Pressable>
              )}
            />

            <Pressable
              onPress={() => setPickerOpen(false)}
              style={{ padding: 12, borderWidth: 1, borderRadius: 12, alignItems: 'center', marginTop: 6 }}
            >
              <Text style={{ fontWeight: '800' }}>Bezár</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
