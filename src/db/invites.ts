import { supabase } from '../lib/supabase';

export type InviteRow = {
  id: string;
  team_id: string;
  code: string;
  role: 'admin' | 'coach' | 'player';
  created_by: string;
  created_at: string;
  expires_at: string | null;
  max_uses: number;
  uses: number;
  disabled: boolean;
};

export async function createInvite(input: {
  teamId: string;
  role?: 'player' | 'coach';
  expiresAt?: string | null;
  maxUses?: number;
}): Promise<InviteRow> {
  const { data, error } = await supabase.rpc('create_team_invite', {
    p_team_id: input.teamId,
    p_role: input.role ?? 'player',
    p_expires_at: input.expiresAt ?? null,
    p_max_uses: input.maxUses ?? 0,
  });

  if (error) throw error;
  return data as InviteRow;
}

export async function redeemInvite(code: string): Promise<{ team_id: string; role: string }> {
  const { data, error } = await supabase.rpc('redeem_team_invite', {
    p_code: code,
  });

  if (error) throw error;
  // Supabase RPC returns array for table returns
  const row = Array.isArray(data) ? data[0] : data;
  return row as { team_id: string; role: string };
}

export async function listInvites(teamId: string): Promise<InviteRow[]> {
  const { data, error } = await supabase.rpc('list_team_invites', { p_team_id: teamId });
  if (error) throw error;
  return (data ?? []) as InviteRow[];
}

export async function setInviteDisabled(inviteId: string, disabled: boolean): Promise<InviteRow> {
  const { data, error } = await supabase.rpc('set_invite_disabled', {
    p_invite_id: inviteId,
    p_disabled: disabled,
  });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as InviteRow;
}