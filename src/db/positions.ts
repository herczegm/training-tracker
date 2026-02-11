import { supabase } from '../lib/supabase';

export type PositionRow = {
    id: number;
    code: string;
    name: string;
    sport: string
};

export async function listPositions(sport: string) {
  const { data, error } = await supabase
    .from('positions')
    .select('id,code,name,sport')
    .eq('sport', sport)
    .order('id');

  if (error) throw error;
  return (data ?? []) as PositionRow[];
}
