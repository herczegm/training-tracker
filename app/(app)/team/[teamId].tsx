import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import { createInvite } from '../../../src/db/invites';
import type { Team } from '../../../src/db/types';
import { getMyRole } from '@/src/db/roles';

export default function TeamHome() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const [inviteLoading, setInviteLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);

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

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={{ fontSize: 24, fontWeight: '700' }}>{team?.name ?? 'Csapat'}</Text>
      )}

      {role !== 'player' && (
        <Link href={{ pathname: '/(app)/team/[teamId]/invites', params: { teamId } }} asChild>
          <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ fontWeight: '700' }}>Invite kezelő</Text>
          </Pressable>
        </Link>
      )}
      
      {role !== 'player' && (
        <Pressable
          onPress={genInvite}
          disabled={inviteLoading}
          style={{ backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {inviteLoading ? 'Készül…' : 'Invite kód generálás (játékos)'}
          </Text>
        </Pressable>
      )}

      {!!lastCode && (
        <Text style={{ fontSize: 18, fontWeight: '800' }}>
          Legutóbbi kód: {lastCode}
        </Text>
      )}

      <Link href="/(app)/join" asChild>
        <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700' }}>Csatlakozás kóddal</Text>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/(app)/team/[teamId]/events', params: { teamId } }} asChild>
        <Pressable style={{ padding: 14, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Események</Text>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/(app)/team/[teamId]/members', params: { teamId } }} asChild>
        <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700' }}>Csapattagok</Text>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/(app)/team/[teamId]/lineups', params: { teamId } }} asChild>
        <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700' }}>Lineupok</Text>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/(app)/team/[teamId]/roster', params: { teamId } }} asChild>
        <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700' }}>Roster</Text>
        </Pressable>
      </Link>

    </View>
  );
}
