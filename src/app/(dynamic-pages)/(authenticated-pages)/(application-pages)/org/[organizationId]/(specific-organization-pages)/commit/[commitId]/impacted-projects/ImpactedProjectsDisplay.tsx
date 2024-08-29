'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { T } from '@/components/ui/Typography';
import { FolderIcon } from 'lucide-react';
import { useState } from 'react';
import { ProjectListType } from '../../../projects/ProjectsWithPagination';
import { OrganizationImpactProjectsTable } from './OrganizationImpactProjectsTable';

type ImpactedProjectsDisplayProps = {
    projects: ProjectListType[]; // Replace 'any' with your actual project type
    projectsWithRunIds: {
        projectId: string;
        runIds: string[];
    }[];
};

export function ImpactedProjectsDisplay({
    projects,
    projectsWithRunIds
}: ImpactedProjectsDisplayProps) {
    const [isGrouped, setIsGrouped] = useState(false);

    const groupedProjects = [
        {
            name: 'modules/vpc/network-gateway',
            projects: projects.slice(0, Math.ceil(projects.length / 2)),
        },
        {
            name: 'modules/sns/topic-digger-state',
            projects: projects.slice(Math.ceil(projects.length / 2)),
        },
    ];

    // Handle odd number of projects
    if (projects.length % 2 !== 0) {
        const middleIndex = Math.floor(projects.length / 2);
        groupedProjects[0].projects = projects.slice(0, middleIndex + 1);
        groupedProjects[1].projects = projects.slice(middleIndex + 1);
    }

    return (
        <div className="space-y-4 transition-all duration-300 ease-in-out">

            <div className="flex items-center space-x-2">
                <Button
                    style={{
                        background: '#0e6402',
                        color: '#fff',
                        borderRadius: '10px 10px',
                    }}

                >Approve all runs</Button>

                <div className="flex items-center space-x-2">
                    <Label htmlFor="group-toggle">Group by module folders</Label>
                    <Switch
                        id="group-toggle"
                        checked={isGrouped}
                        onCheckedChange={setIsGrouped}
                    />
                </div>
            </div>


            <div className={`transition-opacity duration-300 ${isGrouped ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {groupedProjects.map((group) => (
                    <div key={group.name} className="mb-4 flex flex-col gap-4">
                        <T.H4 className="flex items-center">
                            <FolderIcon className="mr-2 h-5 w-5" />
                            Group: {group.name}
                        </T.H4>
                        <OrganizationImpactProjectsTable projects={group.projects} projectsWithRunIds={projectsWithRunIds} />
                    </div>
                ))}
            </div>

            <div className={`transition-opacity duration-300 ${!isGrouped ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                <OrganizationImpactProjectsTable projects={projects} projectsWithRunIds={projectsWithRunIds} />
            </div>
        </div>
    );
}