'use server';
import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { ensureAppAdmin } from './security';

export async function getOrganizationsTotalPages({
  query = '',
  limit = 10,
}: {
  query?: string;
  limit?: number;
}) {
  ensureAppAdmin();
  const { data, error } = await supabaseAdminClient.rpc(
    'app_admin_get_all_organizations_count',
    {
      search_query: query,
    },
  );
  if (error) throw error;
  return Math.ceil(data / limit);
}

export async function getPaginatedOrganizationList({
  limit = 10,
  page,
  query,
}: {
  page?: number;
  query?: string;
  limit?: number;
}) {
  ensureAppAdmin();

  const { data, error } = await supabaseAdminClient.rpc(
    'app_admin_get_all_organizations',
    {
      page: page,
      search_query: query,
      page_size: limit,
    },
  );
  if (error) throw error;
  if (!data) {
    throw new Error('No data');
  }
  return data;
}

export async function getProjectIdsOfOrganization(organizationId: string) {
  const { data, error } = await supabaseAdminClient
    .from('projects')
    .select('id')
    .eq('organization_id', organizationId);
  if (error) throw error;
  return data.map((project) => project.id);
}

export async function getSlimOrganizationsOfUser(userId: string) {
  const { data: organizations, error: organizationsError } =
    await supabaseAdminClient
      .from('organization_members')
      .select('*')
      .eq('member_id', userId);

  if (organizationsError) {
    throw organizationsError;
  }

  const { data, error } = await supabaseAdminClient
    .from('organizations')
    .select('id,title')
    .in(
      'id',
      organizations.map((org) => org.organization_id),
    )
    .order('created_at', {
      ascending: false,
    });
  if (error) {
    throw error;
  }

  const combinedData = data.map((org) => {
    const organization = organizations.find(
      (organization) => organization.organization_id === org.id,
    );
    if (!organization) throw new Error('Organization not found');
    return {
      ...org,
      member_role: organization?.member_role,
    };
  });

  return combinedData;
}
