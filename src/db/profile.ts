import { supabase } from '../lib/supabase';
import { requireUserId } from './auth';

export type ProfileRow = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export async function getMyProfile(): Promise<ProfileRow | null> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ProfileRow | null;
}

export async function updateMyDisplayName(displayName: string): Promise<ProfileRow> {
  const userId = await requireUserId();
  const clean = displayName.trim();

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: clean }, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw error;
  return data as ProfileRow;
}
