import { supabase } from '../lib/supabase';

export type MemberWithProfile = {
  team_id: string;
  user_id: string;
  role: 'admin' | 'coach' | 'player';
  status: string;
  joined_at: string;
  display_name: string | null;
};

export async function listTeamMembers(teamId: string): Promise<MemberWithProfile[]> {
  const { data, error } = await supabase
    .from('team_member_profiles')
    .select('*')
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MemberWithProfile[];
}
