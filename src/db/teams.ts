import { supabase } from '../lib/supabase';
import { requireUserId } from './auth';
import type { Team } from './types';

/**
 * RLS-kompatibilis "my teams" lista:
 * - először lekérjük a user team_members sorait, majd a teameket.
 * Később RLS mellett is működik (csak a saját team_members sorait látja).
 */
export async function listMyTeams(): Promise<Team[]> {

  const { data: memberships, error: mErr } = await supabase
    .from('team_members')
    .select('team_id');

  if (mErr) throw mErr;

  const teamIds = (memberships ?? []).map((m) => m.team_id);
  if (teamIds.length === 0) return [];

  const { data: teams, error: tErr } = await supabase
    .from('teams')
    .select('*')
    .in('id', teamIds)
    .order('created_at', { ascending: false });

  if (tErr) throw tErr;
  return (teams ?? []) as Team[];
}

export async function createTeam(input: {
  orgId: string;
  name: string;
  ageGroup?: string | null;
  season?: string | null;
  creatorRole?: 'admin' | 'coach';
}): Promise<Team> {
  const { data, error } = await supabase.rpc('create_team_with_membership', {
    p_org_id: input.orgId,
    p_name: input.name,
    p_age_group: input.ageGroup ?? null,
    p_season: input.season ?? null,
    p_creator_role: input.creatorRole ?? 'admin',
  });

  if (error) throw error;

  const team = Array.isArray(data) ? data[0] : data;
  
  return team as Team;
}