import { createOrg } from './orgs';
import { createTeam, listMyTeams } from './teams';

export async function devCreateOrgAndTeam(input: { orgName: string; teamName: string }) {
  const org = await createOrg(input.orgName);
  const team = await createTeam({
    orgId: org.id,
    name: input.teamName,
    creatorRole: 'admin',
  });

  // visszaadjuk a friss listát is
  const teams = await listMyTeams();
  return { org, team, teams };
}
