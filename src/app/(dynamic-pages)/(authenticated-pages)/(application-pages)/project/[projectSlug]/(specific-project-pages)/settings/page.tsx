import { getSlimProjectBySlug } from '@/data/user/projects';
import { projectSlugParamSchema } from '@/utils/zod-schemas/params';
import ProjectSettings from '../ProjectSettings';



export default async function ProjectSettingsPage({ params }: { params: unknown }) {
  const { projectSlug } = projectSlugParamSchema.parse(params);
  const project = await getSlimProjectBySlug(projectSlug);
  return (
    <div className="flex flex-col space-y-4 max-w-5xl mt-2">
      <ProjectSettings />
    </div>
  );
}
