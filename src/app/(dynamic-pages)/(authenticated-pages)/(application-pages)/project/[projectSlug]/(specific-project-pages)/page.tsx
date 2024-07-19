import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById, getSlimProjectBySlug } from "@/data/user/projects";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import { CalendarIcon, GitBranchIcon, LayersIcon } from "lucide-react";
import type { Metadata } from "next";

type ProjectPageProps = {
  params: {
    projectSlug: string;
  };
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { projectSlug } = projectSlugParamSchema.parse(params);
  const project = await getSlimProjectBySlug(projectSlug);

  return {
    title: `Project | ${project.name}`,
    description: `View and manage your project ${project.name}`,
  };
}

export default async function ProjectPage({ params }: { params: unknown }) {
  const { projectSlug } = projectSlugParamSchema.parse(params);
  const slimProject = await getSlimProjectBySlug(projectSlug);
  const project = await getProjectById(slimProject.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{project.name}</CardTitle>
            <Badge variant="outline">{project.project_status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <CalendarIcon className="mr-2" />
              <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <LayersIcon className="mr-2" />
              <span>Organization: {project.organization_id}</span>
            </div>
            <div className="flex items-center">
              <GitBranchIcon className="mr-2" />
              <span>Repository: {project.repo_id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Terraform Working Directory:</strong> {project.terraform_working_dir}</p>
            <p><strong>Managing State:</strong> {project.is_managing_state ? 'Yes' : 'No'}</p>
            <p><strong>In Main Branch:</strong> {project.is_in_main_branch ? 'Yes' : 'No'}</p>
            <p><strong>Generated:</strong> {project.is_generated ? 'Yes' : 'No'}</p>
            <p><strong>Latest Action:</strong> {project.latest_action_on ? new Date(project.latest_action_on).toLocaleString() : 'No actions'}</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}