'use server';

import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { SAPayload } from '@/types';
import { revalidatePath } from 'next/cache';
import { getLoggedInUserOrganizationRole } from '../user/organizations';

// server action to delete team from an organization
export const deleteTeamFromOrganization = async (
  teamId: number,
  organizationId: string,
): Promise<SAPayload> => {
  const userRole = await getLoggedInUserOrganizationRole(organizationId);
  if (userRole !== 'admin' && userRole !== 'owner') {
    return {
      status: 'error',
      message: 'User is not an admin',
    };
  }
  const { error } = await supabaseAdminClient
    .from('teams')
    .delete()
    .eq('id', teamId)
    .eq('organization_id', organizationId);

  if (error) {
    console.log('delete error', error);
    return {
      status: 'error',
      message: error.message,
    };
  }

  revalidatePath(`/org/${organizationId}/settings/teams`);

  return {
    status: 'success',
  };
};
