'use client';

import { T } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { approveRun, rejectRun } from "@/data/user/runs";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { ToSnakeCase, ToTitleCase } from "@/lib/utils";
import { Table } from "@/types";
import { DotFilledIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, GitPullRequest, LinkIcon, Loader2, Play, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { statusColors } from "../../(specific-project-pages)/AllRunsTable";


function RenderContent({
    activeStage,
    run,
    tfOutput,
    workflowRunUrl
}: {
    activeStage: string;
    run: Table<'digger_runs'>;
    tfOutput: string | null;
    workflowRunUrl: string | null;
}) {
    if (activeStage === 'plan') {
        return (
            <div className="flex-1 flex flex-col h-[500px]">
                <div className="flex items-center justify-start gap-2 mb-2">
                    <h3 className="text-lg font-semibold ">Terraform Plan Output</h3>

                    {workflowRunUrl && run.status !== ToTitleCase('queued') && (
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={workflowRunUrl}
                                        target="_blank"
                                    >
                                        <LinkIcon className="size-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="flex items-center gap-4">
                                    View workflow run
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                {run.status !== ToTitleCase('queued') &&
                    run.status !== ToTitleCase('pending_plan') &&
                    run.status !== ToTitleCase('running_plan') && (
                        <pre className="bg-muted p-4 rounded-md overflow-auto flex-1 max-h-[600px] text-sm whitespace-pre-wrap">
                            {run.terraform_output || 'No plan output available'}
                        </pre>
                    )}
            </div>
        );
    } else if (activeStage === 'apply') {
        if (run.status === ToTitleCase('pending_approval') || run.status === ToTitleCase('rejected')) {
            return (
                <div className="flex items-center h-[500px] justify-center flex-1">
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-2">Apply not available</p>
                        <p className="text-muted-foreground">The run needs to be approved before applying changes.</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-col flex-1">
                <h3 className="text-lg font-semibold mb-2">Apply logs</h3>
                <div className="dark font-mono bg-muted p-4 rounded-md overflow-auto flex-1 max-h-[600px] text-sm whitespace-pre-wrap text-white">
                    {tfOutput}
                </div>
            </div>
        );
    }
}


export const ProjectRunDetails: React.FC<{
    run: Table<'digger_runs'>,
    loggedInUser: Table<'user_profiles'>
    isUserOrgAdmin: boolean
    tfOutput: string | null
    workflowRunUrl: string | null
    fullRepoName: string | null
}> = ({ run, loggedInUser, isUserOrgAdmin, tfOutput, workflowRunUrl, fullRepoName }) => {
    const router = useRouter();
    const [activeStage, setActiveStage] = useState<'plan' | 'apply'>('plan');

    const { mutate: approveMutation, isLoading: isApproving } = useSAToastMutation(
        async () => await approveRun(run.id, loggedInUser.id),
        {
            loadingMessage: 'Approving run...',
            successMessage: 'Run approved successfully',
            errorMessage: 'Failed to approve run',
            onSuccess: () => {
                router.refresh();
            },
        }
    );

    const { mutate: rejectMutation, isLoading: isRejecting } = useSAToastMutation(
        async () => await rejectRun(run.id, loggedInUser.id),
        {
            loadingMessage: 'Rejecting run...',
            successMessage: 'Run rejected successfully',
            errorMessage: 'Failed to reject run',
            onSuccess: () => {
                router.refresh();
            },
        }
    );

    return (
        <div className="flex rounded-lg bg-background border overflow-hidden h-[calc(100vh-220px)] w-full">
            <motion.div
                className="w-1/4 p-6 border-r flex flex-col"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <CardContent className="bg-muted/50 pt-4 border rounded-lg overflow-hidden">
                    <h2 className="text-lg font-semibold mb-4">Run Details</h2>
                    <div className="space-y-2">
                        <DetailItem label="Triggered at" value={new Date(run.created_at).toLocaleString()} />
                        <DetailItem label="Project" value={run.project_name || 'N/A'} />
                        <DetailItem label="Commit" value={run.commit_id.substring(0, 8)} link={`https://github.com/${fullRepoName}/commit/${run.commit_id}`} />
                        <DetailItem label="Trigger type" value={run.triggertype} />
                        <DetailItem label="Status" value={
                            <Badge className={`${statusColors[ToSnakeCase(run.status)]} pointer-events-none`}>
                                {run.status.toUpperCase()}
                            </Badge>
                        } />
                        {run.pr_number && <DetailItem label="PR Number" value={run.pr_number.toString()} />}
                    </div>
                </CardContent>

                <div className="space-y-2 flex-grow pt-8">
                    <RunStageSidebarItem
                        icon={<GitPullRequest />}
                        name="Plan"
                        isActive={activeStage === 'plan'}
                        isRunning={run.status === ToTitleCase('running_plan')}
                        isComplete={!['queued', 'pending_plan', 'running_plan'].includes(ToSnakeCase(run.status))}
                        onClick={() => setActiveStage('plan')}
                    />
                    {run.status === ToTitleCase('pending_approval') && isUserOrgAdmin && (
                        <Card className="mt-4">
                            <CardContent className="pt-4">
                                <p className="mb-2 text-sm font-medium">Do you approve the proposed changes?</p>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => rejectMutation()} disabled={isRejecting}>
                                        {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Discard'}
                                    </Button>
                                    <Button variant='default' onClick={() => approveMutation()} disabled={isApproving} className="bg-primary text-primary-foreground">
                                        {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Approve'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <RunStageSidebarItem
                        icon={<Play />}
                        name="Apply"
                        isActive={activeStage === 'apply'}
                        isRunning={run.status === ToTitleCase('running_apply')}
                        isComplete={run.status === ToTitleCase('succeeded')}
                        isDisabled={run.status !== ToTitleCase('succeeded')}
                        onClick={() => setActiveStage('apply')}
                    />

                    {run.status === ToTitleCase('running_plan') && (
                        <motion.div
                            className="mt-6 flex items-center justify-center p-12 py-24 bg-muted/50 rounded-lg w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Loader2 className="animate-spin mr-2" />
                            <T.Small className="block">Running plan...</T.Small>
                        </motion.div>
                    )}

                    {run.status === ToTitleCase('running_apply') && (
                        <motion.div
                            className="mt-6 flex items-center justify-center p-12 py-24 bg-muted/50 rounded-lg w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Loader2 className="animate-spin mr-2" />
                            <T.Small className="block">Applying changes...</T.Small>
                        </motion.div>
                    )}

                </div>
                {['approved', 'pending_apply', 'running_apply', 'succeeded', 'failed'].includes(ToSnakeCase(run.status)) && (
                    <T.Small className="flex items-center"><CheckCircle2 className="size-5 text-green-500 mr-2" /> Approved by: </T.Small>
                )}
                {run.status === ToTitleCase('discarded') && (
                    <T.Small className="flex items-center"><XCircle className="text-red-500 mr-2" /> Discarded by: </T.Small>
                )}
                {!(["queued", "pending_plan", "running_plan", "pending_approval"].includes(ToSnakeCase(run.status))) && (
                    <motion.div
                        className="pt-4 mt-auto"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center mb-4">
                            {loggedInUser.avatar_url ? (
                                <Image
                                    src={loggedInUser.avatar_url}
                                    alt={loggedInUser.full_name || 'User Avatar'}
                                    width={40}
                                    height={40}
                                    className="rounded-full mr-3"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                                    {loggedInUser.full_name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                            )}

                            <div>
                                <p className="font-medium">{loggedInUser.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {isUserOrgAdmin ? 'Organization Admin' : 'Member'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div className="flex items-center border-t pt-4 justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock />
                        <p className="text-sm">Total Duration</p>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">4s</p>
                </div>
            </motion.div>
            <motion.div
                className="w-3/4 p-6 flex flex-col h-[500px]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="bg-background text-foreground border-none flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStage}
                            className=" flex-1 flex flex-col"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <RenderContent activeStage={activeStage} run={run} tfOutput={tfOutput} workflowRunUrl={workflowRunUrl} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};


const RunStageSidebarItem: React.FC<{
    icon: React.ReactNode,
    name: string,
    isActive: boolean,
    isRunning: boolean,
    isComplete: boolean,
    isDisabled?: boolean,
    onClick: () => void
}> = ({ icon, name, isActive, isRunning, isComplete, isDisabled = false, onClick }) => (
    <motion.div
        className={`flex items-center justify-between space-x-2 p-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
            } ${isComplete ? '' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={isDisabled ? undefined : onClick}
    >
        <div className="flex items-center gap-2">
            {icon}
            <p className="text-sm">{name}</p>
        </div>
        <div className="flex items-center gap-1 relative w-fit">
            {isComplete && (
                <CheckCircle2 className="h-4 w-4" />
            )}
            {isActive && (
                <DotFilledIcon className="size-6" />
            )}
        </div>
    </motion.div>
);

const DetailItem: React.FC<{ label: string, value: string | React.ReactNode, link?: string }> = ({ label, value, link }) => (
    <div className="flex items-center space-x-2 w-full">
        <p className="text-sm text-[var(--muted-foreground)]">{label}:</p>
        {link ? (
            <Link href={link} className="text-sm text-blue-500 hover:underline" target="_blank">{typeof value === 'string' ? value : value}</Link>
        ) : (
            typeof value === 'string' ? <T.Small className="text-sm">{value}</T.Small> : value
        )}
    </div>
);