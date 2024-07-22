import { z } from 'zod';

export const createOrganizationSchema = z.object({
  organizationTitle: z.string().min(1),
  organizationSlug: z.string().min(1),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;
