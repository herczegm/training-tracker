import { supabase } from '../lib/supabase';

export type TeamPerson = {
  user_id: string;
  display_name: string | null;
  role: 'admin' | 'coach' | 'player';
};

export async function listTeamPeople(teamId: string): Promise<TeamPerson[]> {
  const { data, error } = await supabase
    .from('team_member_profiles')
    .select('user_id,display_name,role')
    .eq('team_id', teamId)
    .order('display_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TeamPerson[];
}
