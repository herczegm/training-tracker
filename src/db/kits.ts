import { supabase } from '../lib/supabase';

export type TeamKit = {
  id: string;
  team_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
};

export async function listTeamKits(teamId: string): Promise<TeamKit[]> {
  const { data, error } = await supabase
    .from('team_kits')
    .select('*')
    .eq('team_id', teamId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TeamKit[];
}

export async function getDefaultKit(teamId: string): Promise<TeamKit | null> {
  const { data, error } = await supabase
    .from('team_kits')
    .select('*')
    .eq('team_id', teamId)
    .eq('is_default', true)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as TeamKit | null;
}
