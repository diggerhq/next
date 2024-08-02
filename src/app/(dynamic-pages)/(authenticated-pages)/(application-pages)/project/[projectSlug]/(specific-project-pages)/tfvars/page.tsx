// page.tsx
import { getAllEnvVars } from "@/data/admin/encryption";
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

    const MASTER_PASSWORD = process.env.MASTER_PASSWORD;
    const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT;

    if (!MASTER_PASSWORD || !ENCRYPTION_SALT) {
        throw new Error('MASTER_PASSWORD or ENCRYPTION_SALT is not set');
    }

    const envVars = await getAllEnvVars(project.id);

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-2">
            <TFVarsDetails
                projectId={project.id}
                initialEnvVars={envVars}
            />
        </div>
    );
}