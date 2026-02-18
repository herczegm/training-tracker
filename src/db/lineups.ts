import { supabase } from '../lib/supabase';

export type LineupRow = {
  id: string;
  event_id: string | null;
  team_id: string;
  template_id: string | null;
  formation: string | null;
  created_by: string;
  created_at: string;
  locked_at: string | null;
};

export type LineupSlotRow = {
  lineup_id: string;
  slot_key: string;
  position_id: number | null;
  user_id: string | null;
  slot_order: number;
};

export type TemplateRow = { id: string; sport: string; name: string };
export type TemplateSlot = {
  template_id: string;
  slot_key: string;
  label: string;
  slot_order: number;
  position_id: number | null;
};

export type LabeledLineupSlotRow = {
  lineup_id: string;
  slot_key: string;
  label: string;
  user_id: string | null;
  position_id: number | null;
  slot_order: number;
  jersey_number: number | null;
  display_name: string | null;
  position_code: string | null;
  position_name: string | null;
};

export async function listTemplates(sport: string = 'generic'): Promise<TemplateRow[]> {
  const { data, error } = await supabase
    .from('lineup_templates')
    .select('id,sport,name')
    .eq('sport', sport)
    .order('name');
  if (error) throw error;
  return (data ?? []) as TemplateRow[];
}

export async function listTemplateSlots(templateId: string): Promise<TemplateSlot[]> {
  const { data, error } = await supabase
    .from('lineup_template_slots')
    .select('template_id,slot_key,label,slot_order,position_id')
    .eq('template_id', templateId)
    .order('slot_order');
  if (error) throw error;
  return (data ?? []) as TemplateSlot[];
}

export async function getLineupByEvent(eventId: string): Promise<LineupRow | null> {
  const { data, error } = await supabase.from('lineups').select('*').eq('event_id', eventId).maybeSingle();
  if (error) throw error;
  return (data ?? null) as LineupRow | null;
}

export async function listLineupSlots(lineupId: string): Promise<LineupSlotRow[]> {
  const { data, error } = await supabase
    .from('lineup_slots')
    .select('*')
    .eq('lineup_id', lineupId)
    .order('slot_order');
  if (error) throw error;
  return (data ?? []) as LineupSlotRow[];
}


export async function createLineupFromTemplate(input: {
  teamId: string;
  templateId: string;
  eventId?: string | null;
  formation?: string | null;
}): Promise<LineupRow> {
  const { data, error } = await supabase.rpc('create_lineup_from_template', {
    p_team_id: input.teamId,
    p_template_id: input.templateId,
    p_event_id: input.eventId ?? null,
    p_formation: input.formation ?? null,
  });

  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as LineupRow;
}

export async function setLineupSlot(input: {
  lineupId: string;
  slotKey: string;
  userId: string;
  positionId?: number | null;
}): Promise<void> {
  const { error } = await supabase.rpc('set_lineup_slot_coach', {
    p_lineup_id: input.lineupId,
    p_slot_key: input.slotKey,
    p_user_id: input.userId,
    p_position_id: input.positionId ?? null,
  });
  if (error) throw error;
}

export async function clearLineupSlot(lineupId: string, slotKey: string): Promise<void> {
  const { error } = await supabase.rpc('clear_lineup_slot_coach', {
    p_lineup_id: lineupId,
    p_slot_key: slotKey,
  });
  if (error) throw error;
}

export async function setLineupLocked(lineupId: string, locked: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_lineup_locked', { p_lineup_id: lineupId, p_locked: locked });
  if (error) throw error;
}

export async function listTeamLineups(teamId: string): Promise<LineupRow[]> {
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as LineupRow[];
}

export async function getLineupById(lineupId: string): Promise<LineupRow> {
  const { data, error } = await supabase.from('lineups').select('*').eq('id', lineupId).single();
  if (error) throw error;
  return data as LineupRow;
}

export async function listLineupSlotsLabeled(lineupId: string): Promise<LabeledLineupSlotRow[]> {
  const { data, error } = await supabase
    .from('lineup_slots_labeled_v2')
    .select('lineup_id,slot_key,label,user_id,position_id,slot_order')
    .eq('lineup_id', lineupId)
    .order('slot_order');

  if (error) throw error;
  return (data ?? []) as LabeledLineupSlotRow[];
}

export async function duplicateLineup(input: {
  sourceLineupId: string;
  targetEventId?: string | null;   // ha matchhez kötöd
  targetFormation?: string | null; // opcionális override
}): Promise<LineupRow> {
  const { data, error } = await supabase.rpc('duplicate_lineup', {
    p_source_lineup_id: input.sourceLineupId,
    p_target_event_id: input.targetEventId ?? null,
    p_target_formation: input.targetFormation ?? null,
  });

  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as LineupRow;
}

export async function listEventLineups(eventId: string): Promise<LineupRow[]> {
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as LineupRow[];
}

export async function getLatestEventLineup(eventId: string): Promise<LineupRow | null> {
  const rows = await listEventLineups(eventId);
  return rows[0] ?? null;
}

export async function listTeamDefaultLineups(teamId: string): Promise<LineupRow[]> {
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .eq('team_id', teamId)
    .is('event_id', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as LineupRow[];
}