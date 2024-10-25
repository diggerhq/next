'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRunsByProjectId } from "@/data/user/runs";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AllRunsTable } from "./AllRunsTable";

export default function AllRunsDetails({
    projectId,
    projectSlug
}: {
    projectId: string;
    projectSlug: string;
}) {

    const { data: runs, isLoading } = useQuery(
        ['runs', projectId],
        async () => {
            return getRunsByProjectId(projectId);
        },
        {
            refetchOnWindowFocus: false,
            refetchInterval: 10000,
        }
    );

    if (isLoading) {
        return (
            <div className="w-full">
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex space-x-4">
                            <Skeleton className="h-12 w-1/4" />
                            <Skeleton className="h-12 w-1/4" />
                            <Skeleton className="h-12 w-1/4" />
                            <Skeleton className="h-12 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!runs) {
        return <Card>
            <CardHeader>
                <CardTitle>Project Runs</CardTitle>
                <CardDescription>View all runs for this project</CardDescription>
            </CardHeader>
            <CardContent>
                <p>No runs found</p>
            </CardContent>
        </Card>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
        >
            <Card className="w-full">
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: 0.1 }}
                >
                    <CardHeader>

                        <CardTitle>Project Runs</CardTitle>
                        <CardDescription>View all runs for this project</CardDescription>

                    </CardHeader>
                </motion.div>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: 0.2 }}
                    >
                        <AllRunsTable runs={runs} projectSlug={projectSlug} />
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}