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

type Team = Tables<'teams'>;

type Props = {
    teams: Team[];
};

export function OrganizationTeamsTable({ teams }: Props) {
    const columns: ColumnDef<Team>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <Link href={`/org/${row.original.organization_id}/team/${row.original.id}`} className='hover:underline'>
                    {row.getValue('name')}
                </Link>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created At',
            cell: ({ row }) => {
                const date = moment(row.getValue('created_at') as string);
                return date.format('MMM DD YYYY, HH:mm [hrs]');
            },
        },
        {
            accessorKey: 'by',
            header: 'By',
            cell: ({ row }) => row.getValue('by') || 'unknown',
        },
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const table = useReactTable({
        data: teams,
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

    if (teams.length === 0) {
        return (
            <Card>
                <div className='flex justify-center w-full items-center h-[180px]'>
                    <T.Subtle>No teams found</T.Subtle>
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