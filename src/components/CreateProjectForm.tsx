'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Check, Github, MonitorOff, Play, RotateCw } from "lucide-react";
import { useState } from 'react';
import { T } from "./ui/Typography";

const MotionCard = motion(Card);

export default function CreateProjectForm({ organizationId }: { organizationId: string }) {
    const [selectedRepo, setSelectedRepo] = useState('');
    const [autoQueueRun, setAutoQueueRun] = useState('apply-before-merge');

    const repositories = [
        { id: 'repo1', name: 'Repository 1' },
        { id: 'repo2', name: 'Repository 2' },
        { id: 'repo3', name: 'Repository 3' },
        { id: 'repo4', name: 'Repository 4' },
        { id: 'repo5', name: 'Repository 5' },
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <T.H3>Create new Project</T.H3>
                    <T.P className="text-muted-foreground">Create a new project within your organization.</T.P>
                </div>
                <div className="flex space-x-2 mt-6">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Project</Button>
                </div>
            </div>

            <MotionCard
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <CardHeader>
                    <div className="flex flex-col">
                        <CardTitle className="text-lg ">Project Details</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">Provide the name of your project</CardDescription>
                    </div>
                </CardHeader>
                <CardContent >
                    <form className="space-y-6">
                        <div>
                            <Label htmlFor="projectName">Project Name *</Label>
                            <Input id="projectName" placeholder="Enter workspace name" className="mt-1" />
                        </div>
                    </form>
                </CardContent>
            </MotionCard>

            <MotionCard
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <CardHeader className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-col">
                        <CardTitle className="text-lg">Select a repository</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">Choose the repository for your project</CardDescription>
                    </div>
                    <Badge variant="outline" size="lg" className="flex py-1.5 items-center space-x-1">
                        <Github className="h-4 w-4 mr-1" />
                        <span>Connected to GitHub</span>
                        <Check className="h-3 w-3 ml-1" />
                    </Badge>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <div className="flex w-max space-x-4 p-4">
                            {repositories.map((repo, index) => (
                                <MotionCard
                                    key={repo.id}
                                    className={`w-[200px] cursor-pointer ${selectedRepo === repo.id ? 'ring-2 ring-primary' : ''}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedRepo(repo.id)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <CardContent className="flex items-center justify-center p-6">
                                        <Github className="mr-2 h-6 w-6" />
                                        <span>{repo.name}</span>
                                    </CardContent>
                                </MotionCard>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </MotionCard>

            <MotionCard
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <CardHeader>
                    <div className="flex flex-col">
                        <CardTitle className="text-lg ">Terraform Configuration</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">Specify the working directory for Terraform</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <Label htmlFor="terraformDir">Terraform Working Directory *</Label>
                        <Input id="terraformDir" placeholder="Enter directory path" className="mt-1" />
                    </div>
                </CardContent>
            </MotionCard>

            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <CardHeader>
                    <div className="flex flex-col">
                        <CardTitle className="text-lg ">Auto Queue Runs</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">Configure when to automatically queue runs</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'apply-before-merge', label: 'Apply Before Merge', icon: Play },
                            { id: 'apply-after-merge', label: 'Apply After Merge', icon: RotateCw },
                            { id: 'never', label: 'Never', icon: MonitorOff },
                        ].map((option, index) => (
                            <MotionCard
                                key={option.id}
                                className={`cursor-pointer ${autoQueueRun === option.id ? 'ring-2 ring-primary' : ''}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setAutoQueueRun(option.id)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <option.icon className="h-6 w-6 mb-2" />
                                    <span>{option.label}</span>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Provide information regarding your project.
                                    </p>
                                </CardContent>
                            </MotionCard>
                        ))}
                    </div>
                </CardContent>
            </MotionCard>
        </div>
    );
}