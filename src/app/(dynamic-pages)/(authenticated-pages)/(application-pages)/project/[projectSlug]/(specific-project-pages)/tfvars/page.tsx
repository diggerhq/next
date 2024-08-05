// page.tsx
import { getAllEnvVars, getOrganizationPublicKey } from "@/data/admin/env-vars";
import { getSlimProjectBySlug } from "@/data/user/projects";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import TFVarsDetails from '../TFVarsDetails';

export async function generateMetadata({
    params,
}: { params: { projectSlug: string } }): Promise<Metadata> {
    const { projectSlug } = projectSlugParamSchema.parse(params);
    const project = await getSlimProjectBySlug(projectSlug);

    return {
        title: `Variables | ${project.name}`,
        description: `Manage variables for ${project.name}`,
    };
}

export default async function TFVarsPage({ params }: { params: unknown }) {
    const { projectSlug } = projectSlugParamSchema.parse(params);
    const project = await getSlimProjectBySlug(projectSlug);
    const [envVars, publicKey] = await Promise.all([
        getAllEnvVars(project.id),
        getOrganizationPublicKey(project.organization_id)
    ]);

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-2">
            <TFVarsDetails
                projectId={project.id}
                orgId={project.organization_id}
                isAllowedSecrets={Boolean(publicKey)}
                initialEnvVars={envVars}
            />
        </div>
    );
}