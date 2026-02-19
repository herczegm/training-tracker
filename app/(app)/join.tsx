import { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { redeemInvite } from '../../src/db/invites';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function JoinTeamScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const join = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;

    try {
      setLoading(true);
      const res = await redeemInvite(c);
      Alert.alert('Siker', 'Csatlakoztál a csapathoz.');
      router.replace({ pathname: '/(app)/team/[teamId]', params: { teamId: res.team_id } });
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült csatlakozni');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
    color: theme.color.text,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  };

  return (
    <Screen scroll>
      <View style={{ flex: 1, justifyContent: 'center', gap: theme.space.lg }}>
        <View style={{ gap: 8 }}>
          <H1>Csatlakozás kóddal</H1>
          <Muted>Add meg az invite kódot (pl. a coach küldte).</Muted>
        </View>

        <Card>
          <View style={{ gap: theme.space.md }}>
            <View style={{ gap: theme.space.sm }}>
              <Small>Invite kód</Small>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Pl.: 8H7K3QWZ"
                placeholderTextColor={theme.color.subtle}
                autoCapitalize="characters"
                autoCorrect={false}
                textContentType="oneTimeCode"
                style={inputStyle}
              />
              <Small>Tipp: a kód nem case-sensitive, de automatikusan nagybetűsítjük.</Small>
            </View>

            <Button
              title={loading ? 'Csatlakozás…' : 'Csatlakozom'}
              onPress={join}
              disabled={loading || code.trim().length === 0}
            />

            {loading && <LoadingView label="Csatlakozás folyamatban..." />}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
