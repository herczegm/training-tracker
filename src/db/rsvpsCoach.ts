import { supabase } from '../lib/supabase';

export type CoachRsvpRow = {
  event_id: string;
  user_id: string;
  status: 'yes' | 'no' | 'maybe';
  note: string | null;
  updated_at: string;
  display_name: string | null;
};

export async function listEventRsvpsWithNames(eventId: string): Promise<CoachRsvpRow[]> {
  const { data, error } = await supabase
    .from('event_rsvp_profiles')
    .select('*')
    .eq('event_id', eventId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CoachRsvpRow[];
}
