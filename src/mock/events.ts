export type EventType = 'training' | 'match' | 'other';

export type Event = {
  id: string;
  teamId: string;
  type: EventType;
  title: string;
  startsAt: string; // ISO
  location?: string;
  notes?: string;
};

export const EVENTS: Event[] = [
  {
    id: 'ev1',
    teamId: 'team_u15',
    type: 'training',
    title: 'Edzés',
    startsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    location: 'Pálya 1',
    notes: 'Bemelegítés + labdás',
  },
  {
    id: 'ev2',
    teamId: 'team_u15',
    type: 'match',
    title: 'Meccs',
    startsAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    location: 'Stadion',
    notes: 'Bajnoki forduló',
  },
];
