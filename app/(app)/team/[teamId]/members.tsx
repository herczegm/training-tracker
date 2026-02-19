import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { listTeamMembers, type MemberWithProfile } from '../../../../src/db/members';

// UI
import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { ListItem } from '@/src/ui/ListItem';
import { EmptyState } from '@/src/ui/EmptyState';
import { LoadingView } from '@/src/ui/LoadingView';
import { H1, H2, Muted, Small } from '@/src/ui/T';
import { theme } from '@/src/ui/theme';

export default function TeamMembersScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();

  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const res = await listTeamMembers(teamId);
      setMembers(res);
    } catch (e: any) {
      Alert.alert('Hiba', e?.message ?? 'Nem sikerült lekérni a tagokat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  if (loading && members.length === 0) {
    return (
      <Screen>
        <LoadingView label="Tagok betöltése..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.space.lg }}>
        {/* Header */}
        <View style={{ gap: 6 }}>
          <H1>Csapattagok</H1>
          <Muted>A csapat jelenlegi tagjai és szerepköreik.</Muted>
        </View>

        {/* List */}
        <Card>
          <View style={{ gap: theme.space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <H2>Lista</H2>
              <Small>{members.length} db</Small>
            </View>

            {loading ? (
              <LoadingView label="Frissítés..." />
            ) : members.length === 0 ? (
              <EmptyState title="Nincs tag" description="Ehhez a csapathoz még nincs felvéve tag." />
            ) : (
              <View style={{ gap: 10 }}>
                {members.map((m) => (
                  <ListItem
                    key={m.user_id}
                    title={m.display_name ?? m.user_id}
                    subtitle={`Role: ${m.role}`}
                    // chevron
                    // rightBadge={m.role.toUpperCase()}
                  />
                ))}
              </View>
            )}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
