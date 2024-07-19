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
import { getRepoDetails } from '@/data/user/repos';
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
import { GitBranch } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ProjectWithRepo = Tables<'projects'> & { repoName: string | null };

type Props = {
  projects: Tables<'projects'>[];
};

export function OrganizationProjectsTable({ projects }: Props) {
  const [projectsWithRepos, setProjectsWithRepos] = useState<ProjectWithRepo[]>([]);

  useEffect(() => {
    const fetchRepoDetails = async () => {
      const updatedProjects = await Promise.all(
        projects.map(async (project) => {
          const repoDetails = await getRepoDetails(project.repo_id);
          return { ...project, repoName: repoDetails?.name ?? null };
        })
      );
      setProjectsWithRepos(updatedProjects);
    };

    fetchRepoDetails();
  }, [projects]);

  const columns: ColumnDef<ProjectWithRepo>[] = [
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
      accessorKey: 'latest_action_on',
      header: 'Latest Action On',
      cell: ({ row }) => {
        const date = moment(row.getValue('latest_action_on') as string);
        return date.format('MMM DD YYYY, HH:mm [hrs]');
      },
    },
    {
      accessorKey: 'by',
      header: 'By',
      cell: ({ row }) => row.getValue('by') || 'unknown',
    },
    {
      accessorKey: 'terraform_working_dir',
      header: 'Configuration Source / Working Directory',
      cell: ({ row }) => (
        <div className="flex items-center bg-muted/50 p-1 rounded-md border w-fit px-2">
          <GitBranch className="mr-1 h-4 w-4" />
          <span>
            {row.original.repoName ? `${row.original.repoName.toLowerCase().replace(/\s+/g, '-').replace(/[A-Z]/g, (letter) => letter.toLowerCase())}` : ''}
            {row.original.repoName && ((row.getValue('terraform_working_dir') as string) || '') ? '/' : ''}
            {((row.getValue('terraform_working_dir') as string) || '').replace(/\s+/g, '-').replace(/[A-Z]/g, (letter) => letter.toLowerCase())}
          </span>
        </div>
      ),
    },
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: projectsWithRepos,
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