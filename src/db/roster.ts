import { supabase } from '../lib/supabase';

export type TeamRosterRow = {
  team_id: string;
  user_id: string;
  display_name: string | null;
  role: 'admin' | 'coach' | 'player';
  jersey_number: number | null;
  team_sport: string;
  is_active: boolean | null;
  note: string | null;
  positions: Array<{ id: number; name: string; code: string; priority: number }>;
};

export async function listTeamRoster(teamId: string): Promise<TeamRosterRow[]> {
  const { data, error } = await supabase
    .from('team_roster')
    .select('*')
    .eq('team_id', teamId)
    .order('display_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TeamRosterRow[];
}

export async function upsertTeamPlayerProfile(input: {
  teamId: string;
  userId: string;
  jerseyNumber?: number | null;
  isActive?: boolean | null;
  note?: string | null;
}) {
  const { data, error } = await supabase.rpc('upsert_team_player_profile_coach', {
    p_team_id: input.teamId,
    p_user_id: input.userId,
    p_jersey_number: input.jerseyNumber ?? null,
    p_is_active: input.isActive ?? null,
    p_note: input.note ?? null,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function replaceTeamPlayerPositions(input: {
  teamId: string;
  userId: string;
  positionIds: number[];
  priorities?: number[];
}) {
  const { error } = await supabase.rpc('replace_team_player_positions_coach', {
    p_team_id: input.teamId,
    p_user_id: input.userId,
    p_position_ids: input.positionIds,
    p_priorities: input.priorities ?? null,
  });
  if (error) throw error;
}
