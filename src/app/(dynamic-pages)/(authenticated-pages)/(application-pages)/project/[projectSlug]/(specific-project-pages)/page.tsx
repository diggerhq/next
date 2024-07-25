

import { getProjectById, getSlimProjectBySlug } from "@/data/user/projects";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
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


import { getRunsByProjectId } from "@/data/user/runs";
import RunDetails from "./RunDetails";

// const dummyRuns: Run[] = [
//   {
//     runId: "run-001",
//     commitId: "abc123",
//     status: "queued",
//     date: "2023-06-01",
//     user: "Alice"
//   },
//   {
//     runId: "run-002",
//     commitId: "def456",
//     status: "pending approval",
//     date: "2023-06-02",
//     user: "Bob"
//   },
//   {
//     runId: "run-003",
//     commitId: "ghi789",
//     status: "running",
//     date: "2023-06-03",
//     user: "Charlie"
//   },
//   {
//     runId: "run-004",
//     commitId: "jkl012",
//     status: "approved",
//     date: "2023-06-04",
//     user: "Diana"
//   },
//   {
//     runId: "run-005",
//     commitId: "mno345",
//     status: "succeeded",
//     date: "2023-06-05",
//     user: "Ethan"
//   },
//   {
//     runId: "run-006",
//     commitId: "pqr678",
//     status: "failed",
//     date: "2023-06-06",
//     user: "Fiona"
//   },
//   {
//     runId: "run-007",
//     commitId: "stu901",
//     status: "queued",
//     date: "2023-06-07",
//     user: "George"
//   },
//   {
//     runId: "run-008",
//     commitId: "vwx234",
//     status: "running",
//     date: "2023-06-08",
//     user: "Hannah"
//   }
// ];

// const runs = dummyRuns;


export default async function ProjectPage({ params }: { params: unknown }) {
  const { projectSlug } = projectSlugParamSchema.parse(params);
  const slimProject = await getSlimProjectBySlug(projectSlug);
  const project = await getProjectById(slimProject.id);
  const runs = await getRunsByProjectId(slimProject.id);

  return (
    <div className="flex flex-col space-y-4 max-w-5xl mt-2">
      <RunDetails
        project={project}
        runs={runs}
      />
    </div>
  );
};