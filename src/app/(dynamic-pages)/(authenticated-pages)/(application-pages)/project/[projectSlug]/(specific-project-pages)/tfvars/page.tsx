import { getSlimProjectBySlug } from "@/data/user/projects";
import { getTFVarsByProjectId } from "@/data/user/runs";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import TFVarsDetails from '../TFVarsDetails';

type TFVarsPageProps = {
    params: {
        projectSlug: string;
    };
};

export async function generateMetadata({
    params,
}: TFVarsPageProps): Promise<Metadata> {
    const { projectSlug } = projectSlugParamSchema.parse(params);
    const project = await getSlimProjectBySlug(projectSlug);

    return {
        title: `TFVars | ${project.name}`,
        description: `Manage Terraform variables for ${project.name}`,
    };
}

export default async function TFVarsPage({ params }: { params: unknown }) {
    const { projectSlug } = projectSlugParamSchema.parse(params);
    const project = await getSlimProjectBySlug(projectSlug);
    const tfvars = await getTFVarsByProjectId(project.id);
    const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'digger-password';
    const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || 'digger-salt';

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-2">
            <TFVarsDetails tfvarsdata={tfvars} projectId={project.id} />
        </div>
    );
}
