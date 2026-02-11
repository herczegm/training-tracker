import { supabase } from '../lib/supabase';

export type RsvpSummary = {
  event_id: string;
  team_id: string;
  yes_count: number;
  no_count: number;
  maybe_count: number;
};

export async function getEventSummary(eventId: string): Promise<RsvpSummary | null> {
  const { data, error } = await supabase
    .from('event_rsvp_summary')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as RsvpSummary | null;
}
