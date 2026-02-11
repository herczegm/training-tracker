export type UUID = string;

export type Org = { id: UUID; name: string; created_at: string; created_by: UUID };
export type Team = { id: UUID; org_id: UUID; name: string; age_group: string | null; season: string | null; created_at: string };
export type TeamMember = { team_id: UUID; user_id: UUID; role: 'admin' | 'coach' | 'player'; status: string; joined_at: string };

export type EventRow = {
  id: UUID;
  team_id: UUID;
  type: 'training' | 'match' | 'other';
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  title: string | null;
  notes: string | null;
  created_by: UUID;
  created_at: string;
  updated_at: string;
};

export type RsvpRow = {
  event_id: UUID;
  user_id: UUID;
  status: 'yes' | 'no' | 'maybe';
  note: string | null;
  updated_at: string;
};