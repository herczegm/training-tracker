// import { getMyRole } from '@/src/db/roles';
// import { listEventRsvpsWithNames, type CoachRsvpRow } from '@/src/db/rsvpsCoach';
// import { useLocalSearchParams } from 'expo-router';
// import { useEffect, useMemo, useState } from 'react';
// import { ActivityIndicator, Alert, FlatList, Modal, Pressable, Text, View } from 'react-native';
// import { getMyRsvp, upsertMyRsvp } from '../../../src/db/rsvps';
// import { getEventSummary, type RsvpSummary } from '../../../src/db/rsvpSummary';
// import type { EventRow, RsvpRow } from '../../../src/db/types';
// import { supabase } from '../../../src/lib/supabase';

// import { listEventRoster, type EventRosterRow } from '@/src/db/eventRoster';
// import {
//   clearLineupSlot,
//   createLineupFromTemplate,
//   duplicateLineup,
//   listEventLineups,
//   listEventPublishedLineups,
//   listLineupSlotsLabeled,
//   listTeamDefaultLineups,
//   listTemplates,
//   setLineupLocked,
//   setLineupSlot,
//   setLineupSlotGroup,
//   type LabeledLineupSlotRow,
//   type LineupRow,
//   type TemplateRow
// } from '../../../src/db/lineups';

// export default function EventDetail() {
//   const { eventId } = useLocalSearchParams<{ eventId: string }>();

//   const [event, setEvent] = useState<EventRow | null>(null);
//   const [rsvp, setRsvp] = useState<RsvpRow | null>(null);
//   const [loading, setLoading] = useState(true);

//   const [summary, setSummary] = useState<RsvpSummary | null>(null);
//   const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);
//   const [coachList, setCoachList] = useState<CoachRsvpRow[]>([]);

//   // Lineup state
//   const [lineup, setLineup] = useState<LineupRow | null>(null);
//   const [lineupSlots, setLineupSlots] = useState<LabeledLineupSlotRow[]>([]);
//   const [templates, setTemplates] = useState<TemplateRow[]>([]);
//   const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

//   // Picker
//   const [pickerOpen, setPickerOpen] = useState(false);
//   const [activeSlotKey, setActiveSlotKey] = useState<string | null>(null);
//   const [eventRoster, setEventRoster] = useState<EventRosterRow[]>([]);
//   const [showDeclined, setShowDeclined] = useState(false);

//   const [eventLineups, setEventLineups] = useState<LineupRow[]>([]);
//   const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);

//   const loadLineupBlock = async (ev: EventRow, teamRole: typeof role) => {
//     if (!teamRole) return;

//     if (ev.type !== 'match') {
//       setLineup(null);
//       setLineupSlots([]);
//       setTemplates([]);
//       setSelectedTemplateId(null);
//       setEventLineups([]);
//       setSelectedLineupId(null);
//       return;
//     }

//     const canCoach = (teamRole === 'admin' || teamRole === 'coach');

//     if (canCoach) {
//       const ppl = await listEventRoster(ev.id);
//       setEventRoster(ppl);
//     } else {
//       setEventRoster([]);
//     }
    
//     const list =  canCoach 
//       ? await listEventLineups(ev.id) 
//       : await listEventPublishedLineups(ev.id);

//     setEventLineups(list);

//     const current = list[0] ?? null;
//     setSelectedLineupId(current?.id ?? null);
//     setLineup(current);

//     if (current) {
//       setLineupSlots(await listLineupSlotsLabeled(current.id));
//     } else {
//       setLineupSlots([]);

//       if (canCoach) {
//         const tpls = await listTemplates('generic'); // később team.sport alapján
//         setTemplates(tpls);
//         setSelectedTemplateId(tpls[0]?.id ?? null);
//       } else {
//         setTemplates([]);
//         setSelectedTemplateId(null);
//       }
//     }
//   };

//   const load = async () => {
//     if (!eventId) return;
//     try {
//       setLoading(true);

//       const { data: ev, error: evErr } = await supabase.from('events').select('*').eq('id', eventId).single();
//       if (evErr) throw evErr;
//       const eventRow = ev as EventRow;
//       setEvent(eventRow);

//       const my = await getMyRsvp(eventId);
//       setRsvp(my);

//       const teamRole = await getMyRole(eventRow.team_id!);
//       setRole(teamRole);

//       const s = await getEventSummary(eventId);
//       setSummary(s);

//       if (teamRole === 'coach' || teamRole === 'admin') {
//         const rows = await listEventRsvpsWithNames(eventId);
//         setCoachList(rows);
//       } else {
//         setCoachList([]);
//       }

//       await loadLineupBlock(eventRow, teamRole);
//     } catch (e: any) {
//       Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [eventId]);

//   const choose = async (status: 'yes' | 'no' | 'maybe') => {
//     if (!eventId) return;
//     try {
//       setLoading(true);
//       const res = await upsertMyRsvp({ eventId, status });
//       setRsvp(res);
//     } catch (e: any) {
//       Alert.alert('Hiba', e?.message ?? 'Nem sikerült menteni');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Lineup actions
//   const createLineup = async () => {
//     if (!eventId || !event || !selectedTemplateId) return;
//     try {
//       setLoading(true);
//       const l = await createLineupFromTemplate({
//         teamId: event.team_id!,
//         templateId: selectedTemplateId,
//         eventId,
//         formation: null,
//       });
//       setLineup(l);
//       const slots = await listLineupSlotsLabeled(l.id);
//       setLineupSlots(slots);
//       const all = await listEventLineups(eventId);
//       setEventLineups(all);
//       setSelectedLineupId(l.id);
//     } catch (e: any) {
//       Alert.alert('Hiba', e?.message ?? 'Nem sikerült lineupot létrehozni');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openPicker = (slotKey: string) => {
//     setActiveSlotKey(slotKey);
//     setPickerOpen(true);
//   };

//   const choosePlayer = async (userId: string) => {
//     if (!lineup || !activeSlotKey) return;
//     try {
//       setLoading(true);
//       await setLineupSlot({ lineupId: lineup.id, slotKey: activeSlotKey, userId });
//       const slots = await listLineupSlotsLabeled(lineup.id);
//       setLineupSlots(slots);
//       setPickerOpen(false);
//       setActiveSlotKey(null);
//     } catch (e: any) {
//       Alert.alert('Hiba', e?.message ?? 'Nem sikerült menteni');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearSlot = async (slotKey: string) => {
//     if (!lineup) return;
//     try {
//       setLoading(true);
//       await clearLineupSlot(lineup.id, slotKey);
//       const slots = await listLineupSlotsLabeled(lineup.id);
//       setLineupSlots(slots);
//     } catch (e: any) {
//       Alert.alert('Hiba', e?.message ?? 'Nem sikerült törölni');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleLock = async () => {
//     if (!lineup) return;
//     try {
//       setLoading(true);

//       await setLineupLocked(lineup.id, !lineup.locked_at);

//       const all = await listEventLineups(eventId);
//       setEventLineups(all);
//       const fresh = all.find(x => x.id === lineup.id) ?? all[0] ?? null;
//       setLineup(fresh);
//       setSelectedLineupId(fresh?.id ?? null);
//       setLineupSlots(fresh ? await listLineupSlotsLabeled(fresh.id) : []);
//     } catch (e: any) {
//       Alert.alert('Hiba', e?.message ?? 'Nem sikerült lockolni');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredPeople = useMemo(() => {
//     const base = eventRoster.filter((p) => p.is_active);
//     const filtered = showDeclined ? base : base.filter((p) => p.rsvp_status !== 'no');
//     return filtered.map((x) => ({
//       user_id: x.user_id,
//       display_name: x.display_name,
//       role: 'player' as const,
//     }));
//   }, [eventRoster, showDeclined]);

//   const createFromDefault = async () => {
//     if (!event || !eventId) return;
//     try {
//       setLoading(true);

//       const defaults = await listTeamDefaultLineups(event.team_id!);
//       if (defaults.length === 0) {
//         Alert.alert('Nincs default lineup', 'Hozz létre előbb egy team default lineupot (event nélkül).');
//         return;
//       }

//       // most egyszerű: a legfrissebbet duplikáljuk
//       const src = defaults[0];

//       const l = await duplicateLineup({
//         sourceLineupId: src.id,
//         targetEventId: eventId,
//         targetFormation: null,
//       });

//       setLineup(l);
//       setLineupSlots(await listLineupSlotsLabeled(l.id));
//       const all = await listEventLineups(eventId);
//       setEventLineups(all);
//       setSelectedLineupId(l.id);
//     } catch (e: any) {
//       Alert.alert('Hiba', e?.message ?? 'Nem sikerült duplikálni');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const moveSlot = async (slotKey: string, groupKey: 'starter' | 'bench') => {
//     if (!lineup) return;
//     try {
//       setLoading(true);
//       await setLineupSlotGroup({ lineupId: lineup.id, slotKey, groupKey });
//       setLineupSlots(await listLineupSlotsLabeled(lineup.id));
//     } catch (e: any) {
//       Alert.alert('Hiba', e?.message ?? 'Nem sikerült mozgatni');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderSlot = (s: LabeledLineupSlotRow) => {
//     const name = s.user_id ? (s.display_name ?? s.user_id) : '—';
//     const num = s.user_id ? (s.jersey_number != null ? `#${s.jersey_number}` : '') : '';
//     const disabled = !!lineup?.locked_at;
//     const isBench = (s as any).group_key === 'bench';

//     return (
//       <View key={s.slot_key} style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 6 }}>
//         <Text style={{ fontWeight: '900' }}>{s.label}</Text>
//         <Text style={{ color: '#444' }}>Játékos: {num} {name}</Text>
//         {canCoach && (
//           <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
//             <Pressable
//               onPress={() => openPicker(s.slot_key)}
//               disabled={disabled}
//               style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
//             >
//               <Text style={{ fontWeight: '700' }}>{disabled ? 'Zárolva' : 'Kiválaszt'}</Text>
//             </Pressable>

//             <Pressable
//               onPress={() => moveSlot(s.slot_key, isBench ? 'starter' : 'bench')}
//               disabled={disabled}
//               style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
//             >
//               <Text style={{ fontWeight: '700' }}>{isBench ? 'Kezdőbe' : 'Cserébe'}</Text>
//             </Pressable>

//             <Pressable
//               onPress={() => clearSlot(s.slot_key)}
//               disabled={disabled}
//               style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
//             >
//               <Text style={{ fontWeight: '700' }}>Clear</Text>
//             </Pressable>
//           </View>
//         )}
//       </View>
//     );
//   };

//   if (loading && !event) {
//     return (
//       <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
//         <ActivityIndicator />
//       </View>
//     );
//   }

//   if (!event) {
//     return (
//       <View style={{ flex: 1, padding: 20 }}>
//         <Text>Nem találom az eseményt.</Text>
//       </View>
//     );
//   }

//   const isMatch = event.type === 'match';
//   const canCoach = (role === 'admin' || role === 'coach');
//   const canSeeLineup = isMatch && !!role;

//   const starters = lineupSlots.filter((s) => (s as any).group_key !== 'bench');
//   const bench = lineupSlots.filter((s) => (s as any).group_key === 'bench');

//   return (
//     <View style={{ flex: 1, padding: 20, gap: 12 }}>
//       <Text style={{ fontSize: 24, fontWeight: '800' }}>{event.title ?? event.type}</Text>
//       <Text style={{ color: '#666' }}>{new Date(event.starts_at).toLocaleString()}</Text>
//       {!!event.location && <Text>📍 {event.location}</Text>}
//       {!!event.notes && <Text style={{ color: '#444' }}>{event.notes}</Text>}

//       <Text style={{ marginTop: 10, fontWeight: '800' }}>Visszajelzés</Text>
//       <Text style={{ color: '#666' }}>Jelenlegi: {rsvp?.status ?? 'nincs'}</Text>

//       <View style={{ flexDirection: 'row', gap: 10 }}>
//         <Pressable onPress={() => choose('yes')} disabled={loading} style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
//           <Text>✅ Igen</Text>
//         </Pressable>
//         <Pressable onPress={() => choose('maybe')} disabled={loading} style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
//           <Text>🤷 Talán</Text>
//         </Pressable>
//         <Pressable onPress={() => choose('no')} disabled={loading} style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
//           <Text>❌ Nem</Text>
//         </Pressable>
//       </View>

//       {!!summary && (
//         <View style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 12 }}>
//           <Text style={{ fontWeight: '800' }}>Összesítés</Text>
//           <Text>✅ Igen: {summary.yes_count}</Text>
//           <Text>🤷 Talán: {summary.maybe_count}</Text>
//           <Text>❌ Nem: {summary.no_count}</Text>
//         </View>
//       )}

//       {/* LINEUP */}
//       {canSeeLineup && (
//         <View style={{ marginTop: 14, padding: 12, borderWidth: 1, borderRadius: 12, gap: 10 }}>
//           <Text style={{ fontSize: 18, fontWeight: '900' }}>Lineup</Text>

//           {eventLineups.length > 1 && (
//             <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
//               {eventLineups.map((l, idx) => (
//                 <Pressable
//                   key={l.id}
//                   onPress={async () => {
//                     setSelectedLineupId(l.id);
//                     setLineup(l);
//                     setLineupSlots(await listLineupSlotsLabeled(l.id));
//                   }}
//                   style={{
//                     paddingVertical: 8,
//                     paddingHorizontal: 10,
//                     borderWidth: 1,
//                     borderRadius: 999,
//                     backgroundColor: selectedLineupId === l.id ? '#000' : 'transparent',
//                   }}
//                 >
//                   <Text style={{ color: selectedLineupId === l.id ? '#fff' : '#000', fontWeight: '800' }}>
//                     {idx === 0 ? 'Latest' : `#${eventLineups.length - idx}`}
//                   </Text>
//                 </Pressable>
//               ))}
//             </View>
//           )}

//           {!lineup ? (
//             canCoach ? (
//               <>
//                 <Pressable
//                   onPress={createFromDefault}
//                   disabled={loading}
//                   style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
//                 >
//                   <Text style={{ color: '#fff', fontWeight: '800' }}>Default lineup átmásolása</Text>
//                 </Pressable>

//                 {templates.length === 0 ? (
//                   <Text style={{ color: '#666' }}>
//                     Nincs lineup template. Hozz létre egyet a DB-ben (lineup_templates + lineup_template_slots).
//                   </Text>
//                 ) : (
//                   <>
//                     <Text style={{ color: '#666' }}>
//                       Template: {templates.find((t) => t.id === selectedTemplateId)?.name}
//                     </Text>

//                     <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
//                       {templates.map((t) => (
//                         <Pressable
//                           key={t.id}
//                           onPress={() => setSelectedTemplateId(t.id)}
//                           style={{
//                             padding: 10,
//                             borderWidth: 1,
//                             borderRadius: 10,
//                             backgroundColor: selectedTemplateId === t.id ? '#000' : 'transparent',
//                           }}
//                         >
//                           <Text style={{ color: selectedTemplateId === t.id ? '#fff' : '#000', fontWeight: '700' }}>
//                             {t.name}
//                           </Text>
//                         </Pressable>
//                       ))}
//                     </View>

//                     <Pressable
//                       onPress={createLineup}
//                       disabled={loading || !selectedTemplateId}
//                       style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
//                     >
//                       <Text style={{ color: '#fff', fontWeight: '800' }}>Lineup létrehozása</Text>
//                     </Pressable>
//                   </>
//                 )}
//               </>
//             ) : (
//               <Text style={{ color: '#666' }}>Még nincs publikált lineup.</Text>
//             )
//           ) : (
//             <>
//               {canCoach && (
//                 <Pressable
//                   onPress={() => setShowDeclined((v) => !v)}
//                   style={{ padding: 10, borderWidth: 1, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}
//                 >
//                   <Text style={{ fontWeight: '800' }}>
//                     {showDeclined ? 'NO-k elrejtése' : 'NO-k megjelenítése'}
//                   </Text>
//                 </Pressable>
//               )}
//               <Pressable
//                 onPress={toggleLock}
//                 disabled={loading}
//                 style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
//               >
//                 <Text style={{ fontWeight: '800' }}>{lineup.locked_at ? 'Unlock' : 'Lock'}</Text>
//               </Pressable>

//               {lineupSlots.length === 0 ? (
//                 <Text style={{ color: '#666' }}>Nincsenek slotok (template slots hiányozhat).</Text>
//               ) : (
//                 <View style={{ gap: 8 }}>
//                   <Text style={{ fontWeight: '900' }}>Kezdő</Text>
//                   {starters.map(renderSlot)}

//                   <Text style={{ fontWeight: '900', marginTop: 10 }}>Csere</Text>
//                   {bench.map(renderSlot)}
//                 </View>
//               )}
//             </>
//           )}

//           {canCoach && (
//             <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
//               <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
//                 <View
//                   style={{
//                     backgroundColor: '#fff',
//                     padding: 16,
//                     borderTopLeftRadius: 16,
//                     borderTopRightRadius: 16,
//                     maxHeight: '70%',
//                   }}
//                 >
//                   <Text style={{ fontSize: 18, fontWeight: '900', marginBottom: 10 }}>Válassz játékost</Text>

//                   <FlatList
//                     data={filteredPeople}
//                     keyExtractor={(p) => p.user_id}
//                     renderItem={({ item }) => (
//                       <Pressable
//                         onPress={() => choosePlayer(item.user_id)}
//                         style={{ padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 8 }}
//                       >
//                         <Text style={{ fontWeight: '800' }}>{item.display_name ?? item.user_id}</Text>
//                         <Text style={{ color: '#666' }}>{item.role}</Text>
//                       </Pressable>
//                     )}
//                   />

//                   <Pressable
//                     onPress={() => setPickerOpen(false)}
//                     style={{ padding: 12, borderWidth: 1, borderRadius: 12, alignItems: 'center', marginTop: 6 }}
//                   >
//                     <Text style={{ fontWeight: '800' }}>Bezár</Text>
//                   </Pressable>
//                 </View>
//               </View>
//             </Modal>
//           )}
//         </View>
//       )}

//       {/* COACH RSVP LIST */}
//       {(role === 'admin' || role === 'coach') && (
//         <View style={{ marginTop: 10, gap: 8 }}>
//           <Text style={{ fontSize: 18, fontWeight: '800' }}>Visszajelzések</Text>

//           {coachList.length === 0 ? (
//             <Text style={{ color: '#666' }}>Még nincs RSVP.</Text>
//           ) : (
//             coachList.map((row) => (
//               <View key={row.user_id} style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
//                 <Text style={{ fontWeight: '800' }}>{row.display_name ?? row.user_id}</Text>
//                 <Text style={{ color: '#666' }}>Státusz: {row.status}</Text>
//                 {!!row.note && <Text style={{ marginTop: 4 }}>{row.note}</Text>}
//               </View>
//             ))
//           )}
//         </View>
//       )}
//     </View>
//   );
// } 

import { getMyRole } from '@/src/db/roles';
import { listEventRsvpsWithNames, type CoachRsvpRow } from '@/src/db/rsvpsCoach';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { getMyRsvp, upsertMyRsvp } from '../../../src/db/rsvps';
import { getEventSummary, type RsvpSummary } from '../../../src/db/rsvpSummary';
import type { EventRow, RsvpRow } from '../../../src/db/types';
import { supabase } from '../../../src/lib/supabase';

import { listEventRoster, type EventRosterRow } from '@/src/db/eventRoster';
import {
  clearLineupSlot,
  createLineupFromTemplate,
  duplicateLineup,
  listEventLineups,
  listEventPublishedLineups,
  listLineupSlotsLabeled,
  listTeamDefaultLineups,
  listTemplates,
  setLineupLocked,
  setLineupSlot,
  setLineupSlotGroup,
  type LabeledLineupSlotRow,
  type LineupRow,
  type TemplateRow,
} from '../../../src/db/lineups';

// UI kit
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { Badge } from '@/src/ui/Badge';
import { Divider } from '@/src/ui/Divider';
import { Section } from '@/src/ui/Section';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { ListItem } from '@/src/ui/ListItem';
import { H1, H2, Muted, P, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [rsvp, setRsvp] = useState<RsvpRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<RsvpSummary | null>(null);
  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);
  const [coachList, setCoachList] = useState<CoachRsvpRow[]>([]);

  // Lineup state
  const [lineup, setLineup] = useState<LineupRow | null>(null);
  const [lineupSlots, setLineupSlots] = useState<LabeledLineupSlotRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlotKey, setActiveSlotKey] = useState<string | null>(null);
  const [eventRoster, setEventRoster] = useState<EventRosterRow[]>([]);
  const [showDeclined, setShowDeclined] = useState(false);

  const [eventLineups, setEventLineups] = useState<LineupRow[]>([]);
  const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);

  const loadLineupBlock = async (ev: EventRow, teamRole: typeof role) => {
    if (!teamRole) return;

    if (ev.type !== 'match') {
      setLineup(null);
      setLineupSlots([]);
      setTemplates([]);
      setSelectedTemplateId(null);
      setEventLineups([]);
      setSelectedLineupId(null);
      setEventRoster([]);
      return;
    }

    const canCoachLocal = teamRole === 'admin' || teamRole === 'coach';

    if (canCoachLocal) {
      const ppl = await listEventRoster(ev.id);
      setEventRoster(ppl);
    } else {
      setEventRoster([]);
    }

    const list = canCoachLocal ? await listEventLineups(ev.id) : await listEventPublishedLineups(ev.id);

    setEventLineups(list);

    const current = list[0] ?? null;
    setSelectedLineupId(current?.id ?? null);
    setLineup(current);

    if (current) {
      setLineupSlots(await listLineupSlotsLabeled(current.id));
      setTemplates([]);
      setSelectedTemplateId(null);
    } else {
      setLineupSlots([]);
      if (canCoachLocal) {
        const tpls = await listTemplates('generic');
        setTemplates(tpls);
        setSelectedTemplateId(tpls[0]?.id ?? null);
      } else {
        setTemplates([]);
        setSelectedTemplateId(null);
      }
    }
  };

  const load = async () => {
    if (!eventId) return;
    try {
      setLoading(true);

      const { data: ev, error: evErr } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (evErr) throw evErr;
      const eventRow = ev as EventRow;
      setEvent(eventRow);

      const my = await getMyRsvp(eventId);
      setRsvp(my);

      const teamRole = await getMyRole(eventRow.team_id!);
      setRole(teamRole);

      const s = await getEventSummary(eventId);
      setSummary(s);

      if (teamRole === 'coach' || teamRole === 'admin') {
        const rows = await listEventRsvpsWithNames(eventId);
        setCoachList(rows);
      } else {
        setCoachList([]);
      }

      await loadLineupBlock(eventRow, teamRole);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const canCoach = role === 'admin' || role === 'coach';
  const isMatch = event?.type === 'match';
  const canSeeLineup = !!event && isMatch && !!role;

  const starters = lineupSlots.filter((s) => (s as any).group_key !== 'bench');
  const bench = lineupSlots.filter((s) => (s as any).group_key === 'bench');

  const choose = async (status: 'yes' | 'no' | 'maybe') => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await upsertMyRsvp({ eventId, status });
      setRsvp(res);
      // opcionális: refresh summary
      const s = await getEventSummary(eventId);
      setSummary(s);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült menteni');
    } finally {
      setLoading(false);
    }
  };

  // Lineup actions
  const createLineup = async () => {
    if (!eventId || !event || !selectedTemplateId) return;
    try {
      setLoading(true);
      const l = await createLineupFromTemplate({
        teamId: event.team_id!,
        templateId: selectedTemplateId,
        eventId,
        formation: null,
      });
      setLineup(l);
      setLineupSlots(await listLineupSlotsLabeled(l.id));

      const all = await listEventLineups(eventId);
      setEventLineups(all);
      setSelectedLineupId(l.id);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült lineupot létrehozni');
    } finally {
      setLoading(false);
    }
  };

  const createFromDefault = async () => {
    if (!event || !eventId) return;
    try {
      setLoading(true);

      const defaults = await listTeamDefaultLineups(event.team_id!);
      if (defaults.length === 0) {
        Alert.alert('Nincs default lineup', 'Hozz létre előbb egy team default lineupot (event nélkül).');
        return;
      }

      const src = defaults[0];

      const l = await duplicateLineup({
        sourceLineupId: src.id,
        targetEventId: eventId,
        targetFormation: null,
      });

      setLineup(l);
      setLineupSlots(await listLineupSlotsLabeled(l.id));

      const all = await listEventLineups(eventId);
      setEventLineups(all);
      setSelectedLineupId(l.id);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült duplikálni');
    } finally {
      setLoading(false);
    }
  };

  const openPicker = (slotKey: string) => {
    setActiveSlotKey(slotKey);
    setPickerOpen(true);
  };

  const choosePlayer = async (userId: string) => {
    if (!lineup || !activeSlotKey) return;
    try {
      setLoading(true);
      await setLineupSlot({ lineupId: lineup.id, slotKey: activeSlotKey, userId });
      setLineupSlots(await listLineupSlotsLabeled(lineup.id));
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
      setLineupSlots(await listLineupSlotsLabeled(lineup.id));
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült törölni');
    } finally {
      setLoading(false);
    }
  };

  const moveSlot = async (slotKey: string, groupKey: 'starter' | 'bench') => {
    if (!lineup) return;
    try {
      setLoading(true);
      await setLineupSlotGroup({ lineupId: lineup.id, slotKey, groupKey });
      setLineupSlots(await listLineupSlotsLabeled(lineup.id));
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült mozgatni');
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async () => {
    if (!lineup) return;
    try {
      setLoading(true);

      await setLineupLocked(lineup.id, !lineup.locked_at);

      // refresh list + current
      const all = await listEventLineups(eventId);
      setEventLineups(all);

      const fresh = all.find((x) => x.id === lineup.id) ?? all[0] ?? null;
      setLineup(fresh);
      setSelectedLineupId(fresh?.id ?? null);
      setLineupSlots(fresh ? await listLineupSlotsLabeled(fresh.id) : []);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült lockolni');
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = useMemo(() => {
    const base = eventRoster.filter((p) => p.is_active);
    const filtered = showDeclined ? base : base.filter((p) => p.rsvp_status !== 'no');
    return filtered.map((x) => ({
      user_id: x.user_id,
      display_name: x.display_name,
      role: 'player' as const,
    }));
  }, [eventRoster, showDeclined]);

  const renderSlotCard = (s: LabeledLineupSlotRow) => {
    const name = s.user_id ? s.display_name ?? s.user_id : '—';
    const num = s.user_id ? (s.jersey_number != null ? `#${s.jersey_number}` : '') : '';
    const disabled = !!lineup?.locked_at;
    const isBenchSlot = (s as any).group_key === 'bench';

    return (
      <Card key={s.slot_key}>
        <Section
          title={s.label}
          right={
            isBenchSlot ? <Badge label="CSERE" tone="muted" /> : <Badge label="KEZDŐ" tone="primary" />
          }
        />
        <Muted>
          Játékos: {num} {name}
        </Muted>

        {canCoach && (
          <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap' }}>
            <Button
              title={disabled ? 'Zárolva' : 'Kiválaszt'}
              onPress={() => openPicker(s.slot_key)}
              disabled={disabled}
              variant={disabled ? 'outline' : 'primary'}
            />
            <Button
              title={isBenchSlot ? 'Kezdőbe' : 'Cserébe'}
              onPress={() => moveSlot(s.slot_key, isBenchSlot ? 'starter' : 'bench')}
              disabled={disabled}
              variant="outline"
            />
            <Button
              title="Clear"
              onPress={() => clearSlot(s.slot_key)}
              disabled={disabled}
              variant="danger"
            />
          </View>
        )}
      </Card>
    );
  };

  // --- RENDER STATES ---
  if (loading && !event) {
    return (
      <Screen centered>
        <LoadingView label="Esemény betöltése…" />
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen centered>
        <EmptyState icon="🗓️" title="Nem találom az eseményt" description="Lehet törölték vagy nincs jogosultságod." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {/* Header */}
      <View style={{ gap: theme.space.sm }}>
        <H1>{event.title ?? event.type}</H1>
        <Muted>{new Date(event.starts_at).toLocaleString()}</Muted>

        <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap' }}>
          {!!event.location && <Badge label={`📍 ${event.location}`} tone="info" />}
          <Badge label={event.type.toUpperCase()} tone="muted" />
          {!!role && <Badge label={role.toUpperCase()} tone={canCoach ? 'primary' : 'muted'} />}
        </View>

        {!!event.notes && (
          <Card>
            <Section title="Megjegyzés" />
            <P>{event.notes}</P>
          </Card>
        )}
      </View>

      {/* RSVP */}
      <Card>
        <Section title="Visszajelzés" right={rsvp?.status ? <Badge label={rsvp.status.toUpperCase()} tone="muted" /> : undefined} />
        <Muted>Jelenlegi: {rsvp?.status ?? 'nincs'}</Muted>

        <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap' }}>
          <Button title="Igen" leftIcon="✅" onPress={() => choose('yes')} disabled={loading} />
          <Button title="Talán" leftIcon="🤷" onPress={() => choose('maybe')} disabled={loading} variant="outline" />
          <Button title="Nem" leftIcon="❌" onPress={() => choose('no')} disabled={loading} variant="danger" />
        </View>

        {!!summary && (
          <>
            <Divider />
            <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap' }}>
              <Badge label={`✅ ${summary.yes_count}`} tone="primary" />
              <Badge label={`🤷 ${summary.maybe_count}`} tone="warn" />
              <Badge label={`❌ ${summary.no_count}`} tone="danger" />
            </View>
          </>
        )}
      </Card>

      {/* LINEUP */}
      {canSeeLineup && (
        <Card>
          <Section title="Lineup" right={lineup?.locked_at ? <Badge label="LOCKED" tone="warn" /> : undefined} />

          {/* lineup switcher */}
          {eventLineups.length > 1 && (
            <View style={{ gap: theme.space.sm }}>
              <Small>Válassz verziót</Small>
              <View style={{ gap: theme.space.sm }}>
                {eventLineups.map((l, idx) => (
                  <ListItem
                    key={l.id}
                    title={idx === 0 ? 'Latest' : `#${eventLineups.length - idx}`}
                    subtitle={l.locked_at ? 'Zárolva' : 'Szerkeszthető'}
                    chevron={false}
                    rightBadge={
                      selectedLineupId === l.id ? <Badge label="AKTÍV" tone="primary" /> : undefined
                    }
                    onPress={async () => {
                      setSelectedLineupId(l.id);
                      setLineup(l);
                      setLineupSlots(await listLineupSlotsLabeled(l.id));
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          <Divider />

          {!lineup ? (
            canCoach ? (
              <View style={{ gap: theme.space.md }}>
                <EmptyState
                  icon="🧩"
                  title="Nincs még lineup"
                  description="Másolj defaultot, vagy hozz létre template-ből."
                />

                <Button title="Default lineup átmásolása" onPress={createFromDefault} disabled={loading} />

                {templates.length === 0 ? (
                  <EmptyState
                    icon="🧱"
                    title="Nincs template"
                    description="Hozz létre DB-ben: lineup_templates + lineup_template_slots."
                  />
                ) : (
                  <View style={{ gap: theme.space.sm }}>
                    <Small>Template kiválasztása</Small>
                    <View style={{ gap: theme.space.sm }}>
                      {templates.map((t) => (
                        <ListItem
                          key={t.id}
                          title={t.name}
                          subtitle={t.id === selectedTemplateId ? 'Kiválasztva' : undefined}
                          chevron={false}
                          rightBadge={t.id === selectedTemplateId ? <Badge label="OK" tone="primary" /> : undefined}
                          onPress={() => setSelectedTemplateId(t.id)}
                        />
                      ))}
                    </View>

                    <Button
                      title="Lineup létrehozása"
                      onPress={createLineup}
                      disabled={loading || !selectedTemplateId}
                    />
                  </View>
                )}
              </View>
            ) : (
              <EmptyState
                icon="🛡️"
                title="Még nincs publikált lineup"
                description="A coach majd publikálja. Később visszanézhető lesz itt."
              />
            )
          ) : (
            <View style={{ gap: theme.space.md }}>
              {canCoach && (
                <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap' }}>
                  <Button
                    title={showDeclined ? 'NO-k elrejtése' : 'NO-k megjelenítése'}
                    onPress={() => setShowDeclined((v) => !v)}
                    variant="outline"
                  />
                  <Button title={lineup.locked_at ? 'Unlock' : 'Lock'} onPress={toggleLock} disabled={loading} />
                </View>
              )}

              {loading && <LoadingView label="Lineup frissítése…" fullHeight={false} />}

              {lineupSlots.length === 0 ? (
                <EmptyState
                  icon="🧠"
                  title="Nincsenek slotok"
                  description="Lehet hiányoznak a template slotok."
                />
              ) : (
                <View style={{ gap: theme.space.md }}>
                  <H2>Kezdő</H2>
                  <View style={{ gap: theme.space.md }}>
                    {starters.map(renderSlotCard)}
                  </View>

                  <H2>Csere</H2>
                  <View style={{ gap: theme.space.md }}>
                    {bench.map(renderSlotCard)}
                  </View>
                </View>
              )}
            </View>
          )}
        </Card>
      )}

      {/* COACH RSVP LIST */}
      {(role === 'admin' || role === 'coach') && (
        <Card>
          <Section title="Visszajelzések" />
          {coachList.length === 0 ? (
            <EmptyState icon="📭" title="Még nincs RSVP" description="Amint jönnek visszajelzések, itt látod." />
          ) : (
            <View style={{ gap: theme.space.sm }}>
              {coachList.map((row) => (
                <ListItem
                  key={row.user_id}
                  title={row.display_name ?? row.user_id}
                  subtitle={row.note ?? undefined}
                  chevron={false}
                  rightBadge={
                    <Badge
                      label={row.status.toUpperCase()}
                      tone={row.status === 'yes' ? 'primary' : row.status === 'no' ? 'danger' : 'warn'}
                    />
                  }
                />
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Picker modal */}
      {canCoach && (
        <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}>
            <View
              style={{
                backgroundColor: theme.color.surface,
                padding: theme.space.lg,
                borderTopLeftRadius: theme.radius.lg,
                borderTopRightRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.color.border,
                maxHeight: '75%',
                gap: theme.space.md,
              }}
            >
              <H2>Válassz játékost</H2>
              <Muted>Csak aktív és (ha úgy állítottad) nem “NO” játékosok.</Muted>

              <FlatList
                data={filteredPeople}
                keyExtractor={(p) => p.user_id}
                contentContainerStyle={{ gap: theme.space.sm }}
                renderItem={({ item }) => (
                  <ListItem
                    title={item.display_name ?? item.user_id}
                    subtitle={item.user_id}
                    chevron={false}
                    onPress={() => choosePlayer(item.user_id)}
                  />
                )}
              />

              <Button title="Bezár" onPress={() => setPickerOpen(false)} variant="outline" />
            </View>
          </View>
        </Modal>
      )}
    </Screen>
  );
}
