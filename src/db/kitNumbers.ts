import { supabase } from '../lib/supabase';

export async function setKitNumber(input: {
  teamId: string;
  kitId: string;
  userId: string;
  jerseyNumber: number;
}) {
  const { data, error } = await supabase.rpc('set_team_kit_number_coach', {
    p_team_id: input.teamId,
    p_kit_id: input.kitId,
    p_user_id: input.userId,
    p_jersey_number: input.jerseyNumber,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function clearKitNumber(input: { teamId: string; kitId: string; userId: string }) {
  const { error } = await supabase.rpc('clear_team_kit_number_coach', {
    p_team_id: input.teamId,
    p_kit_id: input.kitId,
    p_user_id: input.userId,
  });
  if (error) throw error;
}

export async function getKitNumber(input: { teamId: string; kitId: string; userId: string }) {
  const { data, error } = await supabase
    .from('team_kit_numbers')
    .select('jersey_number')
    .eq('team_id', input.teamId)
    .eq('kit_id', input.kitId)
    .eq('user_id', input.userId)
    .maybeSingle();

  if (error) throw error;
  return data?.jersey_number ?? null;
}