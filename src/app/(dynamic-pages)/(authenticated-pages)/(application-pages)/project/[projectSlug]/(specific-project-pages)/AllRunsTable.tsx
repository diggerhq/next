import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tables } from "@/lib/database.types";
import { ToSnakeCase } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";
import moment from "moment";
import Link from "next/link";

export type StatusColor = {
    [key: string]: string;
};

export const statusColors: StatusColor = {
    queued: 'bg-yellow-200/50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    pending_plan: 'bg-amber-200/50 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    running_plan: 'bg-purple-200/50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    pending_approval: 'bg-blue-200/50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    approved: 'bg-green-200/50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    pending_apply: 'bg-green-200/50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    running_apply: 'bg-indigo-200/50 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
    succeeded: 'bg-green-200/50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    failed: 'bg-red-200/50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    discarded: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
};


export const AllRunsTable = ({ runs, projectSlug }: { runs: Tables<'digger_runs'>[], projectSlug: string }) => {
    const sortedRuns = [...runs].sort((a, b) => {
        // Sort primarily by created_at in descending order (most recent first)
        return moment(b.created_at).valueOf() - moment(a.created_at).valueOf();
    });

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-left">Run ID</TableHead>
                    <TableHead className="text-left">Commit ID</TableHead>
                    <TableHead className="text-left">Status</TableHead>
                    <TableHead className="text-left">Last updated</TableHead>
                    <TableHead className="text-left">User</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <AnimatePresence>
                    {sortedRuns.length > 0 ? (
                        sortedRuns.map((run) => (
                            <motion.tr
                                key={run.id}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TableCell>
                                    <Link href={`/project/${projectSlug}/runs/${run.id}`}>
                                        <span className="cursor-pointer hover:underline">
                                            {run.id.length > 8 ? `${run.id.substring(0, 8)}...` : run.id}
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell>{run.commit_id}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ToSnakeCase(run.status)] || ''}`}>
                                        {run.status.toUpperCase()}
                                    </span>
                                </TableCell>
                                <TableCell>{moment(run.updated_at).fromNow()}</TableCell>
                                <TableCell>{run.approval_author}</TableCell>
                            </motion.tr>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="w-full justify-center">
                                <motion.div
                                    className="flex flex-col items-center justify-center mx-auto max-w-96 h-64 text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        className="rounded-full bg-gray-100 p-4 dark:bg-gray-800"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Activity className="h-8 w-8 text-gray-400" />
                                    </motion.div>
                                    <p className="mt-2 text-sm text-foreground">
                                        Runs will appear here once they are initiated. Note you need to setup your repo with digger_workflow.yml to be able to trigger runs, for more information refer to the which includes example workflow file <Link href="https://docs.digger.dev/team/getting-started/gha-aws" className="text-blue-500 underline" >Docs quickstart</Link>
                                    </p>
                                </motion.div>
                            </TableCell>
                        </TableRow>
                    )}
                </AnimatePresence>
            </TableBody>
        </Table>
    );
};