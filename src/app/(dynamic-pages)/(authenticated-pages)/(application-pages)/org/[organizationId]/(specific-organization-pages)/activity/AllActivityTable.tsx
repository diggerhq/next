import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToSnakeCase } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { statusColors } from "../../../../project/[projectSlug]/(specific-project-pages)/AllRunsTable";

export const AllActivityTable = ({ runs, allowedRunsForUser }: {
    runs: {
        id: string;
        commit_id: string;
        status: string;
        updated_at: string;
        project_id: string;
        project_slug: string;
        project_name: string;
        repo_id: number;
        approver_user_name: string | null;
    }[]
    allowedRunsForUser: string[]
}) => {
    const sortedRuns = [...runs].sort((a, b) => {
        return moment(b.updated_at).valueOf() - moment(a.updated_at).valueOf();
    });

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-left">Run ID</TableHead>
                    <TableHead className="text-left">Commit ID</TableHead>
                    <TableHead className="text-left">Status</TableHead>
                    <TableHead className="text-left">Last updated</TableHead>
                    <TableHead className="text-left">Project ID</TableHead>
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
                                    {allowedRunsForUser.includes(run.id) ? (
                                        <Link href={`/project/${run.project_slug}/runs/${run.id}`} className="hover:underline cursor-pointer">
                                            <span>
                                                {run.id.length > 8 ? `${run.id.substring(0, 8)}...` : run.id}
                                            </span>
                                        </Link>
                                    ) : (
                                        <span>
                                            {run.id.length > 8 ? `${run.id.substring(0, 8)}...` : run.id}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{run.commit_id}</TableCell>
                                <TableCell>
                                    <Link href={`/project/${run.project_slug}/runs/${run.id}`} className="hover:underline cursor-pointer">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ToSnakeCase(run.status)] || ''}`}>
                                            {run.status.toUpperCase()}
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell>{moment(run.updated_at).fromNow()}</TableCell>
                                <TableCell>{run.project_name}</TableCell>
                                <TableCell>{run.approver_user_name}</TableCell>
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
                                        No activity found for this organization. Runs will appear here once they are initiated.
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