import { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { listTeamEvents, createEvent } from '../../../../src/db/events';
import type { EventRow } from '../../../../src/db/types';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { ListItem } from '@/src/ui/ListItem';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H2, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

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

  const sorted = useMemo(() => {
    // ha a listTeamEvents már rendez, ez akkor is oké
    return [...events].sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at));
  }, [events]);

  if (loading && events.length === 0) {
    return (
      <Screen>
        <LoadingView label="Események betöltése..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        {/* Header */}
        <View style={{ gap: 6 }}>
          <H1>Események</H1>
          <Muted>Következő edzések, meccsek és csapat események</Muted>
        </View>

        {/* Actions */}
        <Card>
          <View style={{ gap: theme.space.sm }}>
            <H2>Műveletek</H2>

            <Button
              title={loading ? 'Frissítés…' : 'Frissítés'}
              onPress={load}
              disabled={loading}
              variant="secondary"
            />

            {/* DEV gomb külön kártyában, hogy ne keveredjen éles UI-val */}
            <View style={{ marginTop: theme.space.sm }}>
              <Small>Fejlesztői eszköz</Small>
              <Button
                title={loading ? 'Létrehozás…' : 'DEV: Edzés létrehozása holnapra'}
                onPress={quickCreateTraining}
                disabled={loading}
                variant="ghost"
              />
            </View>
          </View>
        </Card>

        {/* List */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <H2>Lista</H2>
              <Small>{sorted.length} db</Small>
            </View>

            {loading ? (
              <LoadingView label="Frissítés..." />
            ) : sorted.length === 0 ? (
              <EmptyState
                title="Nincs még esemény"
                description="Hozz létre egy edzést vagy meccset, és itt fog megjelenni."
              />
            ) : (
              <View style={{ gap: 8 }}>
                {sorted.map((e) => {
                  const title = e.title ?? e.type;
                  const when = new Date(e.starts_at).toLocaleString();
                  const subtitle = e.location ? `${when} • ${e.location}` : when;

                  return (
                    <Link
                      key={e.id}
                      href={{ pathname: '/(app)/event/[eventId]', params: { eventId: e.id } }}
                      asChild
                    >
                      <ListItem
                        title={title}
                        subtitle={subtitle}
                        chevron
                        // opcionális: badge ha van ilyen propod a ListItem-ben
                        // badge={e.type === 'match' ? 'MECCS' : e.type === 'training' ? 'EDZÉS' : undefined}
                      />
                    </Link>
                  );
                })}
              </View>
            )}

            {!loading && sorted.length > 0 && (
              <Muted>
                Tipp: nyisd meg az eseményt, és ott RSVP + (meccsnél) lineup is elérhető.
              </Muted>
            )}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
