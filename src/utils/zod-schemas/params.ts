import { z } from 'zod';

export const organizationParamSchema = z.object({
  organizationId: z.string().uuid(),
});

export const organizationSlugParamSchema = z.object({
  organizationSlug: z.string(),
});

export const projectsfilterSchema = z.object({
  page: z.coerce.number().optional(),
  query: z.string().optional(),
});

export const projectParamSchema = z.object({
  projectId: z.string().uuid(),
});

export const projectSlugParamSchema = z.object({
  projectSlug: z.string(),
});

export const runIdParamSchema = z.object({
  runId: z.string().uuid(),
});
