import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import { redirect } from 'next/navigation';

export default function RunsPage({ params }) {
    const { projectSlug } = projectSlugParamSchema.parse(params);
    redirect(`/project/${projectSlug}`);
}