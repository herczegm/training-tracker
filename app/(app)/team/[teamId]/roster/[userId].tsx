import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { getMyRole } from '../../../../../src/db/roles';
import { listTeamRoster, upsertTeamPlayerProfile, replaceTeamPlayerPositions, type TeamRosterRow } from '../../../../../src/db/roster';
import { listTeamKits, type TeamKit } from '../../../../../src/db/kits';
import { setKitNumber, clearKitNumber, getKitNumber } from '../../../../../src/db/kitNumbers';
import { listPositions, type PositionRow } from '../../../../../src/db/positions';

export default function RosterPlayerEdit() {
    const { teamId, userId } = useLocalSearchParams<{ teamId: string; userId: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [role, setRole] = useState<'admin' | 'coach' | 'player' | null>(null);

    const [player, setPlayer] = useState<TeamRosterRow | null>(null);

    // profile fields
    const [preferredNumber, setPreferredNumber] = useState<string>(''); // inputként string
    const [isActive, setIsActive] = useState(true);
    const [note, setNote] = useState<string>('');

    // kits
    const [kits, setKits] = useState<TeamKit[]>([]);
    const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
    const [kitNumber, setKitNumberState] = useState<string>(''); // input

    // positions
    const [positions, setPositions] = useState<PositionRow[]>([]);
    const [selectedPosIds, setSelectedPosIds] = useState<number[]>([]);

    const canEdit = role === 'admin' || role === 'coach';

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

            // roster row
            const roster = await listTeamRoster(teamId);
            const row = roster.find((x) => x.user_id === userId) ?? null;
            if (!row) {
                setPlayer(null);
                return;
            }
            setPlayer(row);

            // init profile fields
            setPreferredNumber(row?.jersey_number != null ? String(row.jersey_number) : '');
            setIsActive(row?.is_active !== false);
            setNote(row?.note ?? '');

            // kits
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

            // positions: team sport + generic
            const teamSport = row?.team_sport ?? 'soccer';
            const ps1 = await listPositions(teamSport);
            const ps2 = teamSport === 'generic' ? [] : await listPositions('generic');
            const merged = [...ps1, ...ps2];
            setPositions(merged);

            // selected positions from roster view
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

            const pref = preferredNumber.trim() === '' ? null : Number(preferredNumber);
            if (preferredNumber.trim() !== '' && (Number.isNaN(pref) || pref! < 0 || pref! > 999)) {
                Alert.alert('Hiba', 'A preferred mezszám nem valid.');
                return;
            }

            // 1) profile (preferred number + active + note)
            await upsertTeamPlayerProfile({
                teamId,
                userId,
                jerseyNumber: pref,
                isActive,
                note: note.trim() || null,
            });

            // 2) positions replace
            await replaceTeamPlayerPositions({
                teamId,
                userId,
                positionIds: selectedPosIds,
                priorities: selectedPosIds.map((_, i) => i + 1),
            });

            // 3) kit number (ha megadta)
            if (selectedKitId) {
                const kn = kitNumber.trim() === '' ? null : Number(kitNumber);
                if (kitNumber.trim() !== '' && (Number.isNaN(kn) || kn! < 0 || kn! > 999)) {
                    Alert.alert('Hiba', 'A kit mezszám nem valid.');
                    return;
                }

                if (kn == null) {
                    await clearKitNumber({ teamId, kitId: selectedKitId, userId });
                } else {
                    await setKitNumber({ teamId, kitId: selectedKitId, userId, jerseyNumber: kn });
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
            <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!player) {
        return (
            <View style={{ flex: 1, padding: 20 }}>
                <Text>Nem találom a játékost a rosterben.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '900' }}>{player.display_name ?? player.user_id}</Text>

            <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 10 }}>
                <Text style={{ fontWeight: '900' }}>Profil</Text>

                <Text style={{ fontWeight: '700' }}>Preferred mezszám</Text>
                <TextInput
                    value={preferredNumber}
                    onChangeText={setPreferredNumber}
                    keyboardType="numeric"
                    placeholder="pl. 10"
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10 }}
                />

                <Pressable
                    onPress={() => setIsActive((v) => !v)}
                    style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '800' }}>Aktív: {isActive ? 'igen' : 'nem'}</Text>
                </Pressable>

                <Text style={{ fontWeight: '700' }}>Megjegyzés</Text>
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="opcionális"
                    multiline
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, minHeight: 60 }}
                />
            </View>

            <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 10 }}>
                <Text style={{ fontWeight: '900' }}>Mezszám (kit szerint)</Text>

                <Text style={{ color: '#666' }}>
                    (Most még nem töltjük vissza a meglévőt UI-ba; mentés működik. Következő lépésben beolvassuk view-ból.)
                </Text>

                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                    {kits.map((k) => (
                        <Pressable
                            key={k.id}
                            onPress={() => setSelectedKitId(k.id)}
                            style={{
                                padding: 10,
                                borderWidth: 1,
                                borderRadius: 10,
                                backgroundColor: selectedKitId === k.id ? '#000' : 'transparent',
                            }}
                        >
                            <Text style={{ color: selectedKitId === k.id ? '#fff' : '#000', fontWeight: '800' }}>
                                {k.name}{k.is_default ? ' (default)' : ''}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={{ fontWeight: '700' }}>Kit mezszám</Text>
                <TextInput
                    value={kitNumber}
                    onChangeText={setKitNumberState}
                    keyboardType="numeric"
                    placeholder="pl. 18 (üres = törlés)"
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10 }}
                />
            </View>

            <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 10 }}>
                <Text style={{ fontWeight: '900' }}>Posztok</Text>

                {positions.length === 0 ? (
                    <Text style={{ color: '#666' }}>Nincs pozíció a csapat sportjához.</Text>
                ) : (
                    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                        {positions.map((p) => {
                            const on = selectedPosIds.includes(p.id);
                            return (
                                <Pressable
                                    key={p.id}
                                    onPress={() => togglePos(p.id)}
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 10,
                                        borderWidth: 1,
                                        borderRadius: 999,
                                        backgroundColor: on ? '#000' : 'transparent',
                                    }}
                                >
                                    <Text style={{ color: on ? '#fff' : '#000', fontWeight: '800' }}>{p.code}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </View>

            <Pressable
                onPress={save}
                disabled={!canEdit || saving}
                style={{ backgroundColor: '#000', padding: 14, borderRadius: 12, alignItems: 'center' }}
            >
                <Text style={{ color: '#fff', fontWeight: '900' }}>{saving ? 'Mentés…' : 'Mentés'}</Text>
            </Pressable>
        </View>
    );
}
