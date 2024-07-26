import { ApplicationLayoutShell } from '@/components/ApplicationLayoutShell';
import { InternalNavbar } from '@/components/NavigationMenu/InternalNavbar';
import { Suspense, type ReactNode } from 'react';


export default async function ProjectLayout({
    params,
    children,
    navbar,
    sidebar,
}: {
    children: ReactNode;
    params: unknown;
    navbar: ReactNode;
    sidebar: ReactNode;
}) {

    return (

        <ApplicationLayoutShell sidebar={sidebar}>
            <div className="">
                <InternalNavbar>
                    <div className="flex w-full justify-between items-center">
                        <Suspense>{navbar}</Suspense>
                    </div>
                </InternalNavbar>
                <div className="m-6">
                    {children}
                </div>
            </div>
        </ApplicationLayoutShell>
    );
}
