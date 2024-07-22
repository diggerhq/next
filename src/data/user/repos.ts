'use server';

import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { revalidatePath } from 'next/cache';

export async function getRepoDetails(repoId: number) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('repos')
    .select('id, repo_full_name')
    .eq('id', repoId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getOrganizationRepos(organizationId: string) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('repos')
    .select('id, repo_full_name')
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }

  revalidatePath(`/org/${organizationId}/projects`, 'page');
  revalidatePath(`/org/${organizationId}/projects/create`, 'page');

  return data;
}
