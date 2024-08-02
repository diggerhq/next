
import { PageHeading } from '@/components/PageHeading';
import { Search } from '@/components/Search';
import { Button } from '@/components/ui/button';
import { T } from '@/components/ui/Typography';
import { getSlimTeamById } from '@/data/user/teams';
import { projectsfilterSchema } from '@/utils/zod-schemas/params';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { z } from 'zod';
import { ProjectsTableWithPagination } from '../../../(specific-organization-pages)/projects/ProjectsWithPagination';

const paramsSchema = z.object({
    teamId: z.coerce.number(),
    organizationId: z.string(),
});

export default async function TeamPage({
    params,
    searchParams
}: {
    params: {
        teamId: string;
    };
    searchParams: unknown
}) {
    const parsedParams = paramsSchema.parse(params);
    const filters = projectsfilterSchema.parse(searchParams);
    const { teamId, organizationId } = parsedParams;
    const slimteam = await getSlimTeamById(teamId);
    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-2">
            <PageHeading
                title={slimteam?.name ?? 'Team'}
                subTitle="You can create projects within team"
            />
            <div className="flex justify-between gap-2">
                <div className="md:w-1/3">
                    <Search placeholder="Search project" />
                    {filters.query && (
                        <p className="text-sm ml-2 mt-4">
                            Searching for <span className="font-bold">{filters.query}</span>
                        </p>
                    )}
                </div>
                <div className="flex space-x-4">
                    <Link href={`/org/${organizationId}/projects/create`}>
                        <Button variant="default" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </Link>
                </div>
            </div>
            {
                <Suspense
                    fallback={
                        <T.P className="text-muted-foreground my-6">
                            Loading team...
                        </T.P>
                    }
                >
                    <ProjectsTableWithPagination
                        organizationId={organizationId}
                        teamId={teamId}
                        searchParams={searchParams}
                    />
                </Suspense>
            }
        </div>
    );
}

