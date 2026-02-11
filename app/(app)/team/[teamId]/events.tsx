import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { listTeamEvents, createEvent } from '../../../../src/db/events';
import type { EventRow } from '../../../../src/db/types';

export default function EventsScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const e = await listTeamEvents(teamId);
      setEvents(e);
    } catch (err: any) {
      Alert.alert('Hiba', err?.message ?? 'Nem sikerült lekérni az eseményeket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  const quickCreateTraining = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const starts = new Date(Date.now() + 24 * 3600 * 1000);
      const ends = new Date(starts.getTime() + 90 * 60 * 1000);
      await createEvent({
        teamId,
        type: 'training',
        startsAt: starts.toISOString(),
        endsAt: ends.toISOString(),
        title: 'Edzés',
        location: 'Pálya 1',
        notes: 'Gyorsan felvitt edzés (dev)',
      });
      await load();
    } catch (err: any) {
      Alert.alert('Hiba', err?.message ?? 'Nem sikerült létrehozni');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Események</Text>

      <Pressable
        onPress={quickCreateTraining}
        disabled={loading}
        style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>DEV: Edzés létrehozása holnapra</Text>
      </Pressable>

      <Pressable onPress={load} disabled={loading} style={{ padding: 10, alignItems: 'center' }}>
        <Text style={{ fontWeight: '600' }}>Frissítés</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator />
      ) : events.length === 0 ? (
        <Text style={{ color: '#666' }}>Nincs még esemény. Hozz létre egyet.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {events.map((e) => (
            <Link key={e.id} href={{ pathname: '/(app)/event/[eventId]', params: { eventId: e.id } }} asChild>
              <Pressable style={{ padding: 14, borderWidth: 1, borderRadius: 12, gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: '800' }}>{e.title ?? e.type}</Text>
                <Text style={{ color: '#666' }}>{new Date(e.starts_at).toLocaleString()}</Text>
                {!!e.location && <Text style={{ color: '#666' }}>{e.location}</Text>}
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </View>
  );
}
