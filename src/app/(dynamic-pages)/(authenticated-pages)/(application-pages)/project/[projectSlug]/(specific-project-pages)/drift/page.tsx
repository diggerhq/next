import { getProjectById, getSlimProjectBySlug } from '@/data/user/projects';
import { projectSlugParamSchema } from '@/utils/zod-schemas/params';



export default async function ProjectSettingsPage({ params }: { params: unknown }) {
    const { projectSlug } = projectSlugParamSchema.parse(params);
    const projectId = (await getSlimProjectBySlug(projectSlug)).id;
    const project = await getProjectById(projectId);

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-2">
            <pre className="bg-muted p-4 rounded-md overflow-auto flex-1 max-h-[600px] text-sm whitespace-pre-wrap">
                {project.latest_drift_output || "No drift detected as of last run"}
            </pre>
        </div>
    );
}