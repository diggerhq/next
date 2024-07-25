'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/lib/database.types";
import { motion } from "framer-motion";
import { RunsTable } from "./RunsTable";

export default function RunDetails({ runs, project }: { runs: Tables<'digger_runs'>[], project: Tables<'projects'> }) {
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
                        <RunsTable runs={runs} />
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}