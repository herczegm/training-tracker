export type RSVPStatus = 'yes' | 'no' | 'maybe';

const store = new Map<string, RSVPStatus>(); // key: eventId

export function getRsvp(eventId: string): RSVPStatus | null {
  return store.get(eventId) ?? null;
}

export function setRsvp(eventId: string, status: RSVPStatus) {
  store.set(eventId, status);
}
