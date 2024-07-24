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

    async function handleUpdate(oldName: string, newName: string, value: string, isSecret: boolean) {
        'use server'
        if (oldName !== newName) {
            await deleteEnvVar(project.id, oldName);
        }
        await storeEncryptedEnvVar(project.id, newName, value, isSecret, MASTER_PASSWORD, ENCRYPTION_SALT);
        return getAllEnvVars(project.id, MASTER_PASSWORD, ENCRYPTION_SALT);
    }

    async function handleDelete(name: string) {
        'use server'
        await deleteEnvVar(project.id, name);
        return getAllEnvVars(project.id, MASTER_PASSWORD, ENCRYPTION_SALT);
    }

    async function handleBulkUpdate(vars: EnvVar[]) {
        'use server'
        const currentVars = await getAllEnvVars(project.id, MASTER_PASSWORD, ENCRYPTION_SALT);
        const currentVarsMap = Object.fromEntries(currentVars.map(v => [v.name, v]));

        for (const newVar of vars) {
            const currentVar = currentVarsMap[newVar.name];
            if (currentVar) {
                if (!currentVar.is_secret && (currentVar.value !== newVar.value || currentVar.name !== newVar.name)) {
                    await handleUpdate(currentVar.name, newVar.name, newVar.value, currentVar.is_secret);
                }
            } else {
                await handleUpdate(newVar.name, newVar.name, newVar.value, false);
            }
        }

        for (const currentVar of currentVars) {
            if (!vars.some(v => v.name === currentVar.name) && !currentVar.is_secret) {
                await deleteEnvVar(project.id, currentVar.name);
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