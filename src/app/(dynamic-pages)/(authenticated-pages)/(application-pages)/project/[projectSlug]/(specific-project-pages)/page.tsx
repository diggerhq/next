import { getSlimProjectBySlug } from "@/data/user/projects";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import AllRunsDetails from "./AllRunsDetails";

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


  return (
    <div className="flex flex-col space-y-4 max-w-5xl mt-2">
      <AllRunsDetails projectId={slimProject.id} projectSlug={projectSlug} />
    </div>
  );
};