'use client';
import { Badge } from '@/components/ui/badge';
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { T } from '@/components/ui/Typography';
import { Table } from '@/types';
import Check from 'lucide-react/dist/esm/icons/check';
import Pen from 'lucide-react/dist/esm/icons/pen-tool';
import ThumbsUp from 'lucide-react/dist/esm/icons/thumbs-up';
import Timer from 'lucide-react/dist/esm/icons/timer';
import moment from 'moment';
import Link from 'next/link';

export const ProjectsTable = ({
    projects,
}: {
    projects: Table<'projects'>[];
}) => {
    if (projects.length === 0) {
        return (
            <T.P className="text-muted-foreground my-6">
                🔍 No matching projects found.
            </T.P>
        );
    }
    return (
        <div className="mt-6 flow-root">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                    {/* <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg"></div> */}
                    {/* <div className="flex rounded-lg bg-clip-border border border-gray-200  max-w-[1296px] overflow-hidden"> */}
                    <div className="border rounded-lg shadow-sm overflow-hidden">
                        <ShadcnTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Project Status</TableHead>
                                    <TableHead>Created on</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell>
                                            <Link
                                                href={`/project/${project.id}`}
                                                className=" font-medium underline underline-offset-4 "
                                            >
                                                {project.name}
                                            </Link>
                                        </TableCell>

                                        <TableCell>
                                            {/* Add your project status rendering logic here */}
                                            {project.project_status === 'completed' ? (
                                                <Badge variant="default">
                                                    <Check size={16} className="mr-1" />
                                                    Completed
                                                </Badge>
                                            ) : project.project_status === 'pending_approval' ? (
                                                <Badge variant="outline">
                                                    <Pen size={16} className="mr-1" />
                                                    Pending Approval
                                                </Badge>
                                            ) : project.project_status === 'approved' ? (
                                                <Badge variant="secondary">
                                                    <ThumbsUp size={16} className="mr-1" />
                                                    Approved
                                                </Badge>
                                            ) : project.project_status === 'draft' ? (
                                                <Badge variant="default">
                                                    <Timer size={16} className="mr-1" />
                                                    Draft
                                                </Badge>
                                            ) : (
                                                <Badge>
                                                    <Timer size={16} />
                                                    <T.P>
                                                        {String(project.project_status).replace('_', ' ')}
                                                    </T.P>
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {moment(project.created_at).format('LLL')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ShadcnTable>
                    </div>
                </div>
            </div>
        </div>
    );
};