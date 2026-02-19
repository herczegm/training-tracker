import { useEffect, useMemo, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { createInvite, listInvites, setInviteDisabled, type InviteRow } from '../../../../src/db/invites';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { ListItem } from '@/src/ui/ListItem';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H2, H3, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function InvitesScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InviteRow[]>([]);

  const [role, setRole] = useState<'player' | 'coach'>('player');
  const [maxUses, setMaxUses] = useState('0'); // 0=unlimited
  const [expiresHours, setExpiresHours] = useState('0'); // 0 = never

  const expiresAt = useMemo(() => {
    const h = Number(expiresHours);
    if (!h || h <= 0) return null;
    return new Date(Date.now() + h * 3600 * 1000).toISOString();
  }, [expiresHours]);

  const load = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const res = await listInvites(teamId);
      setItems(res);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült betölteni az invite-okat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  const generate = async () => {
    if (!teamId) return;
    try {
      setLoading(true);

      const inv = await createInvite({
        teamId,
        role,
        maxUses: Math.max(0, Number(maxUses) || 0),
        expiresAt,
      });

      Alert.alert('Új kód', inv.code);
      await load();
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült létrehozni');
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (inv: InviteRow) => {
    try {
      setLoading(true);
      await setInviteDisabled(inv.id, !inv.disabled);
      await load();
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült módosítani');
    } finally {
      setLoading(false);
    }
  };

  const chipStyle = (active: boolean) => ({
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    borderColor: theme.color.border,
    backgroundColor: active ? theme.color.primary : 'transparent',
  });

  const chipTextStyle = (active: boolean) => ({
    fontWeight: '900' as const,
    color: active ? theme.color.primaryText : theme.color.text,
  });

  if (loading && items.length === 0) {
    return (
      <Screen>
        <LoadingView label="Invite-ok betöltése..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        {/* Header */}
        <View style={{ gap: 6 }}>
          <H1>Invite kódok</H1>
          <Muted>Adj hozzá új játékost vagy edzőt gyorsan egy kóddal.</Muted>
        </View>

        {/* Create */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <View style={{ gap: 4 }}>
              <H2>Új invite</H2>
              <Small>0 = korlátlan / soha nem jár le</Small>
            </View>

            {/* Role chips */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                title="Player"
                onPress={() => setRole('player')}
                variant={role === 'player' ? 'primary' : 'secondary'}
                disabled={loading}
              />
              <Button
                title="Coach"
                onPress={() => setRole('coach')}
                variant={role === 'coach' ? 'primary' : 'secondary'}
                disabled={loading}
              />
            </View>

            {/* Inputs */}
            <View style={{ gap: theme.space.sm }}>
              <View>
                <H3>Max uses</H3>
                <TextInput
                  value={maxUses}
                  onChangeText={setMaxUses}
                  placeholder="0 = unlimited"
                  keyboardType="numeric"
                  placeholderTextColor={theme.color.subtle}
                  style={{
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: theme.color.border,
                    borderRadius: theme.radius.md,
                    padding: 12,
                    color: theme.color.text,
                    backgroundColor: 'transparent',
                  }}
                />
              </View>

              <View>
                <H3>Lejárat (óra)</H3>
                <TextInput
                  value={expiresHours}
                  onChangeText={setExpiresHours}
                  placeholder="0 = never"
                  keyboardType="numeric"
                  placeholderTextColor={theme.color.subtle}
                  style={{
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: theme.color.border,
                    borderRadius: theme.radius.md,
                    padding: 12,
                    color: theme.color.text,
                    backgroundColor: 'transparent',
                  }}
                />
              </View>

              <Muted>
                {expiresAt
                  ? `Lejár: ${new Date(expiresAt).toLocaleString()}`
                  : 'Lejárat: soha'}
              </Muted>
            </View>

            <Button
              title={loading ? 'Generálás…' : 'Kód generálás'}
              onPress={generate}
              disabled={loading}
              variant="primary"
            />

            <Button
              title={loading ? 'Frissítés…' : 'Frissítés'}
              onPress={load}
              disabled={loading}
              variant="ghost"
            />
          </View>
        </Card>

        {/* List */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <H2>Aktív kódok</H2>
              <Small>{items.length} db</Small>
            </View>

            {loading ? (
              <LoadingView label="Frissítés..." />
            ) : items.length === 0 ? (
              <EmptyState
                title="Nincs invite"
                description="Hozz létre egy új kódot fent, és itt meg fog jelenni."
              />
            ) : (
              <View style={{ gap: 10 }}>
                {items.map((inv) => {
                  const usesText = `${inv.uses}/${inv.max_uses === 0 ? '∞' : inv.max_uses}`;
                  const expiresText = inv.expires_at ? new Date(inv.expires_at).toLocaleString() : 'never';
                  const status = inv.disabled ? 'Disabled' : 'Active';

                  return (
                    <Card key={inv.id}>
                      <View style={{ gap: 10 }}>
                        <View style={{ gap: 4 }}>
                          <H2>{inv.code}</H2>
                          <Muted>
                            Role: {inv.role} • Uses: {usesText}
                          </Muted>
                          <Muted>Expires: {expiresText}</Muted>

                          <Small>
                            Állapot:{' '}
                            <Small>
                              {status}
                            </Small>
                          </Small>
                        </View>

                        <Button
                          title={inv.disabled ? 'Engedélyezés' : 'Tiltás'}
                          onPress={() => toggle(inv)}
                          disabled={loading}
                          variant={inv.disabled ? 'secondary' : 'danger'}
                        />
                      </View>
                    </Card>
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
