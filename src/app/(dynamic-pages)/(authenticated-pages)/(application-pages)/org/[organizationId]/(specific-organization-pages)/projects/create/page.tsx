import CreateProjectForm from "@/components/CreateProjectForm";
import { getOrganizationRepos } from "@/data/user/repos";
import { getTeamsInOrganization } from "@/data/user/teams";
import { organizationParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Project",
    description: "Create a new project within your organization.",
};

export default async function CreateProjectPage({
    params,
}: {
    params: unknown;
}) {
    const { organizationId } = organizationParamSchema.parse(params);
    const [repositories, fullTeams] = await Promise.all([
        getOrganizationRepos(organizationId),
        getTeamsInOrganization(organizationId)
    ]);

    const teams = fullTeams.map(({ id, name }) => ({ id, name }));

    return (
        <div className="w-full mt-1">
            <CreateProjectForm organizationId={organizationId} repositories={repositories} teams={teams} />
        </div>
    );
}