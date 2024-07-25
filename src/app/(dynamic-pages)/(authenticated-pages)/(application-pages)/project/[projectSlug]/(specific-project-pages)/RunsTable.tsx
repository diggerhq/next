import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tables } from "@/lib/database.types";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import moment from "moment";

type StatusColor = {
    [key: string]: string;
};

const statusColors: StatusColor = {
    queued: 'bg-yellow-200/50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    'pending_approval': 'bg-blue-200/50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    running: 'bg-purple-200/50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    approved: 'bg-green-200/50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    succeeded: 'bg-green-200/50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    failed: 'bg-red-200/50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

export const RunsTable = ({ runs }: { runs: Tables<'digger_runs'>[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="text-left">Run ID</TableHead>
                <TableHead className="text-left">Commit ID</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Date</TableHead>
                <TableHead className="text-left">User</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {runs.length > 0 ? (
                runs.map((run) => (
                    <TableRow key={run.id}>
                        <TableCell >{run.id.length > 8 ? `${run.id.substring(0, 8)}...` : run.id}</TableCell>
                        <TableCell>{run.commit_id}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[run.status.toLowerCase()] || ''}`}>
                                {run.status.toUpperCase()}
                            </span>
                        </TableCell>
                        <TableCell>{moment(run.created_at).fromNow()}</TableCell>
                        <TableCell>{run.approval_author}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5}>
                        <motion.div
                            className="flex flex-col items-center justify-center h-64 text-center"
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
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No runs available</h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Runs will appear here once they are initiated.
                            </p>
                        </motion.div>
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);