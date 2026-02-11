import { supabase } from '../lib/supabase';
import { requireUserId } from './auth';
import type { RsvpRow } from './types';

export async function upsertMyRsvp(input: {
  eventId: string;
  status: 'yes' | 'no' | 'maybe';
  note?: string | null;
}): Promise<RsvpRow> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert(
      {
        event_id: input.eventId,
        user_id: userId,
        status: input.status,
        note: input.note ?? null,
      },
      { onConflict: 'event_id,user_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data as RsvpRow;
}

export async function getMyRsvp(eventId: string): Promise<RsvpRow | null> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as RsvpRow | null;
}
