import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Project = {
    name: string;
    runId: string;
    latestActionOn: string;
    similarity?: string;
};

type ProjectsTableProps = {
    projects: Project[];
    showSimilarity: boolean;
};

export function ProjectsTable({ projects, showSimilarity }: ProjectsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Run ID</TableHead>
                    <TableHead>Latest Action On</TableHead>
                    {showSimilarity && <TableHead>Similarity</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {projects.map((project) => (
                    <TableRow key={project.runId}>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{project.runId}</TableCell>
                        <TableCell>{project.latestActionOn}</TableCell>
                        {showSimilarity && <TableCell>{project.similarity}</TableCell>}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}