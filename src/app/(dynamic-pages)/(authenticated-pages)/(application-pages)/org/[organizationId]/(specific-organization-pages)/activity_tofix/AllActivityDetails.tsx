'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllRunsByOrganizationId } from "@/data/user/runs";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AllActivityTable } from "./AllActivityTable";

export default function AllActivityDetails({
    organizationId,
    allowedProjectIdsForUser
}: {
    organizationId: string;
    allowedProjectIdsForUser: string[];
}) {
    const { data: runs, isLoading } = useQuery(
        ['runs', organizationId],
        async () => {
            return getAllRunsByOrganizationId(organizationId);
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

    if (!runs || runs.length === 0) {
        return <Card>
            <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>View all activity in this organization</CardDescription>
            </CardHeader>
            <CardContent>
                <p>No activity found</p>
            </CardContent>
        </Card>
    }

    // const filteredRuns = runs.filter(run => allowedProjectIdsForUser.includes(run.project_id));
    const filteredRuns = runs;

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
                        <CardTitle>Organization Activity</CardTitle>
                        <CardDescription>View all activity for this organization</CardDescription>
                    </CardHeader>
                </motion.div>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: 0.2 }}
                    >
                        <AllActivityTable runs={runs.map(run => ({
                            ...run,
                            repo_full_name: run.repos?.repo_full_name || 'Unknown repository',
                            project_name: run.project_name || run.projects?.name || 'Unknown',
                            project_slug: run.projects?.slug || 'Unknown',
                        }))}
                            allowedRunsForUser={filteredRuns.map(run => run.id)}
                        />
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}