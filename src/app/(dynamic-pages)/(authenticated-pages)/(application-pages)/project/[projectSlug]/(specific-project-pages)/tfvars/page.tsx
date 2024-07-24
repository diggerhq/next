import { deleteEnvVar, getAllEnvVars, storeEncryptedEnvVar } from "@/data/admin/encryption";
import { getSlimProjectBySlug } from "@/data/user/projects";
import { EnvVar } from "@/types/userTypes";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import TFVarsDetails from '../TFVarsDetails';

export async function generateMetadata({
    params,
}: { params: { projectSlug: string } }): Promise<Metadata> {
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

    const MASTER_PASSWORD = process.env.MASTER_PASSWORD;
    const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT;

    if (!MASTER_PASSWORD || !ENCRYPTION_SALT) {
        throw new Error('MASTER_PASSWORD or ENCRYPTION_SALT is not set');
    }

    const envVars = await getAllEnvVars(project.id, MASTER_PASSWORD, ENCRYPTION_SALT);

    async function handleUpdate(name: string, value: string, isSecret: boolean) {
        'use server'
        await storeEncryptedEnvVar(project.id, name, value, isSecret, MASTER_PASSWORD, ENCRYPTION_SALT);
        return getAllEnvVars(project.id, MASTER_PASSWORD, ENCRYPTION_SALT);
    }

    async function handleDelete(name: string) {
        'use server'
        await deleteEnvVar(project.id, name);
        return getAllEnvVars(project.id, MASTER_PASSWORD, ENCRYPTION_SALT);
    }

    async function handleBulkUpdate(vars: EnvVar[]) {
        'use server'
        for (const envVar of vars) {
            if (!envVar.is_secret) {
                await storeEncryptedEnvVar(project.id, envVar.name, envVar.value, envVar.is_secret, MASTER_PASSWORD, ENCRYPTION_SALT);
            }
        }
        return getAllEnvVars(project.id, MASTER_PASSWORD, ENCRYPTION_SALT);
    }

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-2">
            <TFVarsDetails
                tfvarsdata={{
                    id: project.id,
                    project_id: project.id,
                    tfvars: envVars,
                    updated_at: new Date().toISOString()
                }}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onBulkUpdate={handleBulkUpdate}
            />
        </div>
    );
}