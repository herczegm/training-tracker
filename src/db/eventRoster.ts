import { supabase } from '../lib/supabase';

export type EventRosterRow = {
  event_id: string;
  team_id: string;
  user_id: string;
  display_name: string | null;
  is_active: boolean;
  preferred_jersey_number: number | null;
  rsvp_status: 'yes' | 'no' | 'maybe' | null;
};

export async function listEventRoster(eventId: string): Promise<EventRosterRow[]> {
  const { data, error } = await supabase
    .from('event_roster')
    .select('*')
    .eq('event_id', eventId)
    .order('display_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventRosterRow[];
}
