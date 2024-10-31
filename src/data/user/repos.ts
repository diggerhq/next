'use server';

import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { PrismaClient } from '@prisma/client';
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
  const prisma = new PrismaClient();
  try {
    const data = await prisma.repos.findMany({
      where: {
        organization_id: organizationId,
        deleted_at: null,
      },
      select: {
        id: true,
        repo_full_name: true,
      },
    });

    console.log(`get org repos: ${data} org: ${organizationId}`);

    revalidatePath(`/org/${organizationId}/projects`, 'page');
    revalidatePath(`/org/${organizationId}/projects/create`, 'page');

    return data;
  } finally {
    await prisma.$disconnect();
  }
}
