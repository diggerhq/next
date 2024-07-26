'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/lib/database.types";
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { statusColors } from "../../(specific-project-pages)/RunsTable";

export const RunDetails: React.FC<{ run: Tables<'digger_runs'> }> = ({ run }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Run {run.id}
                    </CardTitle>
                    <Badge className={statusColors[run.status]}>
                        {run.status.toUpperCase()}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Commit: {run.commit_id}</p>
                            <p className="text-xs text-muted-foreground">Date: {run.created_at}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                    }`}
                            />
                        </Button>
                    </div>
                    <AnimatePresence>
                        {isExpanded && run.status && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4"
                            >
                                <h4 className="text-sm font-semibold mb-2">Plan Summary</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-green-500 font-bold">{run.status}</span>
                                        <span className="text-xs">Created</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-yellow-500 font-bold">{run.status}</span>
                                        <span className="text-xs">Updated</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-red-500 font-bold">{run.status}</span>
                                        <span className="text-xs">Deleted</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
};
