// page.tsx
import { getAllEnvVars, getOrganizationPublicKey } from "@/data/admin/env-vars";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getSlimProjectBySlug, getSlimProjectWithTeamIdBySlug } from "@/data/user/projects";
import { getLoggedInUserTeamRole } from "@/data/user/teams";
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
    const project = await getSlimProjectWithTeamIdBySlug(projectSlug);
    const [envVars, publicKey, orgRole, teamRole] = await Promise.all([
        getAllEnvVars(project.id),
        getOrganizationPublicKey(project.organization_id),
        getLoggedInUserOrganizationRole(project.organization_id),
        project.team_id ? getLoggedInUserTeamRole(project.team_id) : Promise.resolve(null)
    ]);
    const isTeamAdmin = teamRole === 'admin';
    const isOrgAdmin = orgRole === 'admin' || orgRole === 'owner';
    const canEdit = isTeamAdmin || isOrgAdmin;

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-2">
            <TFVarsDetails
                projectId={project.id}
                orgId={project.organization_id}
                isAllowedSecrets={Boolean(publicKey) && canEdit}
                initialEnvVars={envVars}
            />
        </div>
    );
}