import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Run = {
    runId: string;
    commitId: string;
    status: string;
    date: string;
    user: string;
};

type StatusColor = {
    [key: string]: string;
};

const statusColors: StatusColor = {
    queued: 'bg-yellow-200/50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    'pending approval': 'bg-blue-200/50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    running: 'bg-purple-200/50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    approved: 'bg-green-200/50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    succeeded: 'bg-green-200/50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    failed: 'bg-red-200/50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

export const RunsTable = ({ runs }: { runs: Run[] }) => (
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
                    <TableRow key={run.runId}>
                        <TableCell>{run.runId}</TableCell>
                        <TableCell>{run.commitId}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[run.status.toLowerCase()] || ''}`}>
                                {run.status.toUpperCase()}
                            </span>
                        </TableCell>
                        <TableCell>{run.date}</TableCell>
                        <TableCell>{run.user}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">No runs available</TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);