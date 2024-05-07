// https://github.com/vercel/next.js/issues/58272
import { T } from '@/components/ui/Typography';
import { getProjectById } from '@/data/user/projects';
import { Layers } from 'lucide-react';
import Link from 'next/link';

import { Suspense } from 'react';
import { z } from 'zod';

const paramsSchema = z.object({
  projectId: z.string(),
});

async function Title({ projectId }: { projectId: string }) {
  const project = await getProjectById(projectId);
  return (
    <div className="flex items-center gap-2">
      <Layers className="w-4 h-4" />
      <T.P>{project.name}</T.P>
      <div className="flex items-center gap-2 p-0.5 px-2 rounded-full text-xs font-normal  text-gray-600 dark:text-slate-300 border border-gray-600 dark:border-slate-300  uppercase ">
        Project
      </div>
    </div>
  );
}

export default async function ProjectNavbar({ params }: { params: unknown }) {
  const { projectId } = paramsSchema.parse(params);
  return (
    <div className="flex items-center">
      <Link href={`/project/${projectId}`}>
        <span className="space-x-2 flex items-center">
          <Suspense fallback={<span>Loading...</span>}>
            <Title projectId={projectId} />
          </Suspense>
        </span>
      </Link>
    </div>
  );
}
