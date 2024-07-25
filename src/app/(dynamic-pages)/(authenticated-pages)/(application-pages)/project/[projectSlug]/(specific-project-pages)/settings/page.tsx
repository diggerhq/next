import { getProjectById, getSlimProjectBySlug } from '@/data/user/projects';
import { getRepoDetails } from '@/data/user/repos';
import { projectSlugParamSchema } from '@/utils/zod-schemas/params';
import ProjectSettings from '../ProjectSettings';



export default async function ProjectSettingsPage({ params }: { params: unknown }) {
  const { projectSlug } = projectSlugParamSchema.parse(params);
  const projectData = await getSlimProjectBySlug(projectSlug);
  const project = await getProjectById(projectData.id);
  const repository = await getRepoDetails(project.repo_id);
  return (
    <div className="flex flex-col space-y-4 max-w-5xl mt-2">
      <ProjectSettings project={project} repositoryName={repository.repo_full_name} />
    </div>
  );
}
