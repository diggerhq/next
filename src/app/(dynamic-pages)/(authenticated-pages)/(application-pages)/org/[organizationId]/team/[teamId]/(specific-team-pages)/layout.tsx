
import { ApplicationLayoutShell } from '@/components/ApplicationLayoutShell';
import { InternalNavbar } from '@/components/NavigationMenu/InternalNavbar';
import SettingsIcon from 'lucide-react/dist/esm/icons/settings';
import Link from 'next/link';
import { ReactNode, Suspense } from 'react';
import { z } from 'zod';
import { TeamSidebar } from './@sidebar/TeamSidebar';

const paramsSchema = z.object({
    teamId: z.coerce.number(),
    organizationId: z.string(),
});

export default async function Layout({
    children,
    params,
    navbar,
}: {
    children: ReactNode;

    navbar: ReactNode;
} & {
    params: {
        teamId: string;
    };
}) {
    const parsedParams = paramsSchema.parse(params);
    const { teamId, organizationId } = parsedParams;
    return (
        <ApplicationLayoutShell sidebar={<TeamSidebar teamId={teamId} />}>
            <div>
                <InternalNavbar>
                    <div className="flex w-full justify-between items-center">
                        <Suspense>{navbar}</Suspense>
                        <div className="flex items-center space-x-2">
                            <Link
                                className="flex gap-1.5 py-1.5 px-3 cursor-pointer items-center group rounded-md transition hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                                href={`/org/${organizationId}/team/${teamId}/settings`}
                            >
                                <SettingsIcon className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300" />
                                <p className="text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300 text-sm font-normal">
                                    Team settings
                                </p>
                            </Link>
                        </div>
                    </div>
                </InternalNavbar>
                <div className="relative flex-1 h-auto mt-6 w-full overflow-auto">
                    <div className="px-6 space-y-6 pb-10">{children}</div>
                </div>
            </div>
        </ApplicationLayoutShell>
    );
}