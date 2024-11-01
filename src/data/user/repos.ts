'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getRepoDetails(repoId: number) {
  const prisma = new PrismaClient();

  try {
    const repo = await prisma.repos.findUnique({
      where: {
        id: repoId,
      },
      select: {
        id: true,
        repo_full_name: true,
      },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    return repo;
  } finally {
    await prisma.$disconnect();
  }
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
