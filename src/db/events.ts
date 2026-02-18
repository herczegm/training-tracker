import { supabase } from '../lib/supabase';
import { requireUserId } from './auth';
import type { EventRow } from './types';

export async function createEvent(input: {
  teamId: string;
  type: 'training' | 'match' | 'other';
  startsAt: string; // ISO
  endsAt?: string | null;
  location?: string | null;
  title?: string | null;
  notes?: string | null;
}): Promise<EventRow> {
  const { data, error } = await supabase.rpc('create_event_coach', {
    p_team_id: input.teamId,
    p_type: input.type,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt ?? null,
    p_location: input.location ?? null,
    p_title: input.title ?? null,
    p_notes: input.notes ?? null,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as EventRow;
}

export async function listTeamEvents(teamId: string): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .order('starts_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function updateEvent(eventId: string, patch: {
  type?: 'training' | 'match' | 'other';
  startsAt?: string;
  endsAt?: string | null;
  location?: string | null;
  title?: string | null;
  notes?: string | null;
}): Promise<EventRow> {
  const { data, error } = await supabase.rpc('update_event_coach', {
    p_event_id: eventId,
    p_type: patch.type ?? null,
    p_starts_at: patch.startsAt ?? null,
    p_ends_at: patch.endsAt ?? null,
    p_location: patch.location ?? null,
    p_title: patch.title ?? null,
    p_notes: patch.notes ?? null,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as EventRow;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_event_coach', { p_event_id: eventId });
  if (error) throw error;
}

export async function setEventKit(input: { eventId: string; kitId: string }) {
  const { data, error } = await supabase.rpc('set_event_kit_coach', {
    p_event_id: input.eventId,
    p_kit_id: input.kitId,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}