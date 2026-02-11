import { supabase } from '../lib/supabase';
import { requireUserId } from './auth';

export type TeamRole = 'admin' | 'coach' | 'player';

export async function getMyRole(teamId: string): Promise<TeamRole | null> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.role ?? null) as TeamRole | null;
}
