import { supabase } from '../lib/supabase';
import type { Org } from './types';

export async function createOrg(name: string): Promise<Org> {
  const { data, error } = await supabase.rpc('create_org', { p_name: name });

  if (error) throw error;

  const org = Array.isArray(data) ? data[0] : data;
  return org as Org;
}
