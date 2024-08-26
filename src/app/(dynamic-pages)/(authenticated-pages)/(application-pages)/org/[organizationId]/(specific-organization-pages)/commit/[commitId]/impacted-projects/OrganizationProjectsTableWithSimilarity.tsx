"use client";
import { T } from '@/components/ui/Typography';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Tables } from '@/lib/database.types';
import { getRandomRunId } from '@/lib/utils';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import moment from 'moment';
import Link from 'next/link';
import { useState } from 'react';
import { ProjectListType } from '../../../projects/ProjectsWithPagination';

type ProjectWithRepo = Tables<'projects'> & { repoFullName: string | null };

type Props = {
    projects: ProjectListType[];
    projectsWithRunIds: {
        projectId: string;
        runIds: string[];
    }[];
};

export function OrganizationProjectsTableWithSimilarity({ projects, projectsWithRunIds }: Props) {

    let similarity = true;

    const columns: ColumnDef<ProjectListType>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <Link href={`/project/${row.original.slug}`} className='hover:underline'>
                    {row.getValue('name')}
                </Link>
            ),
        },
        {
            accessorKey: 'runId',
            header: 'Run ID',
            cell: ({ row }) => {
                const projectRunIds = projectsWithRunIds.find(p => p.projectId === row.original.id)?.runIds || [];
                const randomRunId = getRandomRunId(projectRunIds);
                return randomRunId ? (
                    <Link href={`/project/${row.original.slug}/runs/${randomRunId}`}>
                        <span className="cursor-pointer hover:underline">
                            {randomRunId.length > 8 ? `${randomRunId.substring(0, 8)}...` : randomRunId}
                        </span>
                    </Link>
                ) : 'N/A';
            },
        },
        {
            accessorKey: 'latest_action_on',
            header: 'Latest Action On',
            cell: ({ row }) => {
                const date = moment(row.getValue('latest_action_on') as string);
                return date.format('MMM DD YYYY, HH:mm [hrs]');
            },
        },
        {
            accessorKey: 'similarity',
            header: 'Similarity',
            cell: () => similarity ? 'Yes' : 'No',
        },
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const table = useReactTable({
        data: projects,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    if (projects.length === 0) {
        return (
            <Card>
                <div className='flex justify-center w-full items-center h-[180px]'>
                    <T.Subtle>No projects found</T.Subtle>
                </div>
            </Card>
        );
    }

    return (
        <div className="w-full">
            <Card className="p-4">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} className="text-left font-normal text-sm text-muted-foreground">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} className="hover:bg-muted/50">
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id} className="py-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}