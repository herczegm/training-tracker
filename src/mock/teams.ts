export type Team = {
  id: string;
  name: string;
  ageGroup?: string;
};

export const TEAMS: Team[] = [
  { id: 'team_u15', name: 'U15', ageGroup: 'U15' },
  { id: 'team_u13', name: 'U13', ageGroup: 'U13' },
];
