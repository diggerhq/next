'use client';

import { T } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { approveRun, changeRunStatus, rejectRun } from "@/data/user/runs";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { Table } from "@/types";
import { DotFilledIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, GitPullRequest, Loader2, Play, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { statusColors } from "../../(specific-project-pages)/RunsTable";

type RunStage = 'pending_approval' | 'pending_apply' | 'rejected' | 'applied';


const logEntries = [
    { time: "2024-07-01T12:34:56Z", author: "Siddharth Ponnapalli", title: "Added basic VPC setup" },
    { time: "2024-07-01T13:45:22Z", author: "Siddharth Ponnapalli", title: "Added subnets and associated them with VPC" },
    { time: "2024-07-02T09:14:33Z", author: "Siddharth Ponnapalli", title: "Created security groups for web servers" },
    { time: "2024-07-02T10:22:12Z", author: "Siddharth Ponnapalli", title: "Added EC2 instances in different subnets" },
    { time: "2024-07-03T11:55:47Z", author: "Siddharth Ponnapalli", title: "Configured S3 buckets and objects" },
    { time: "2024-07-03T14:33:29Z", author: "Siddharth Ponnapalli", title: "Added RDS instance with MySQL" },
    { time: "2024-07-04T08:45:22Z", author: "Siddharth Ponnapalli", title: "Created IAM role, policy, and instance profile" },
    { time: "2024-07-04T10:12:09Z", author: "Siddharth Ponnapalli", title: "Added third EC2 instance with IAM role" },
    { time: "2024-07-05T11:34:56Z", author: "Siddharth Ponnapalli", title: "Updated security group rules for enhanced security" },
    { time: "2024-07-05T13:45:22Z", author: "Siddharth Ponnapalli", title: "Refactored subnet CIDR blocks for better segmentation" },
    { time: "2024-07-06T09:14:33Z", author: "Siddharth Ponnapalli", title: "Improved S3 bucket policies for enhanced security" },
    { time: "2024-07-06T10:22:12Z", author: "Siddharth Ponnapalli", title: "Added outputs for easier infrastructure management" },
    { time: "2024-07-07T11:55:47Z", author: "Siddharth Ponnapalli", title: "Enhanced instance tagging for better identification" },
    { time: "2024-07-07T14:33:29Z", author: "Siddharth Ponnapalli", title: "Updated RDS instance settings for improved performance" },
    { time: "2024-07-08T08:45:22Z", author: "Siddharth Ponnapalli", title: "Optimized VPC and subnet configurations" },
    { time: "2024-07-08T10:12:09Z", author: "Siddharth Ponnapalli", title: "Cleaned up IAM policies for better security practices" },
    { time: "2024-07-09T11:34:56Z", author: "Siddharth Ponnapalli", title: "Added new S3 bucket for log storage" },
    { time: "2024-07-09T13:45:22Z", author: "Siddharth Ponnapalli", title: "Implemented CloudWatch logs for monitoring" },
    { time: "2024-07-10T09:14:33Z", author: "Siddharth Ponnapalli", title: "Configured CloudFront distribution for S3 bucket" },
    { time: "2024-07-10T10:22:12Z", author: "Siddharth Ponnapalli", title: "Added Route 53 records for domain management" },
    { time: "2024-07-11T11:55:47Z", author: "Siddharth Ponnapalli", title: "Updated EC2 instance types for better performance" },
    { time: "2024-07-11T14:33:29Z", author: "Siddharth Ponnapalli", title: "Refined security group rules for better protection" },
    { time: "2024-07-12T08:45:22Z", author: "Siddharth Ponnapalli", title: "Added auto-scaling configuration for EC2 instances" },
    { time: "2024-07-12T10:12:09Z", author: "Siddharth Ponnapalli", title: "Configured RDS backup and retention policies" },
    { time: "2024-07-13T11:34:56Z", author: "Siddharth Ponnapalli", title: "Updated IAM role policies for least privilege access" },
    { time: "2024-07-13T13:45:22Z", author: "Siddharth Ponnapalli", title: "Implemented Lambda function for automated backups" },
    { time: "2024-07-14T09:14:33Z", author: "Siddharth Ponnapalli", title: "Integrated CloudWatch alarms for monitoring" },
    { time: "2024-07-14T10:22:12Z", author: "Siddharth Ponnapalli", title: "Updated S3 bucket lifecycle policies for cost optimization" },
    { time: "2024-07-15T11:55:47Z", author: "Siddharth Ponnapalli", title: "Configured VPC peering for multi-region setup" },
    { time: "2024-07-15T14:33:29Z", author: "Siddharth Ponnapalli", title: "Enhanced CloudFront caching settings" },
    { time: "2024-07-16T08:45:22Z", author: "Siddharth Ponnapalli", title: "Added new security group for database access" },
    { time: "2024-07-16T10:12:09Z", author: "Siddharth Ponnapalli", title: "Updated RDS instance class for better performance" },
    { time: "2024-07-17T11:34:56Z", author: "Siddharth Ponnapalli", title: "Implemented SNS for notification alerts" },
    { time: "2024-07-17T13:45:22Z", author: "Siddharth Ponnapalli", title: "Configured SES for email notifications" },
    { time: "2024-07-18T09:14:33Z", author: "Siddharth Ponnapalli", title: "Added DynamoDB table for session management" },
    { time: "2024-07-18T10:22:12Z", author: "Siddharth Ponnapalli", title: "Updated IAM policies for DynamoDB access" },
    { time: "2024-07-19T11:55:47Z", author: "Siddharth Ponnapalli", title: "Enhanced EC2 instance monitoring with detailed metrics" },
    { time: "2024-07-19T14:33:29Z", author: "Siddharth Ponnapalli", title: "Configured VPC flow logs for network monitoring" },
    { time: "2024-07-20T08:45:22Z", author: "Siddharth Ponnapalli", title: "Updated security group ingress rules for specific IP ranges" },
    { time: "2024-07-20T10:12:09Z", author: "Siddharth Ponnapalli", title: "Added IAM policy for S3 read-only access" },
    { time: "2024-07-21T11:34:56Z", author: "Siddharth Ponnapalli", title: "Refined Lambda function code for efficiency" },
    { time: "2024-07-21T13:45:22Z", author: "Siddharth Ponnapalli", title: "Enhanced VPC subnet configuration for better isolation" },
    { time: "2024-07-22T09:14:33Z", author: "Siddharth Ponnapalli", title: "Configured CloudFormation stack for infrastructure as code" },
    { time: "2024-07-22T10:22:12Z", author: "Siddharth Ponnapalli", title: "Updated EC2 instance AMI for latest security patches" },
    { time: "2024-07-23T11:55:47Z", author: "Siddharth Ponnapalli", title: "Implemented SSM for instance management" },
    { time: "2024-07-23T14:33:29Z", author: "Siddharth Ponnapalli", title: "Enhanced IAM roles for cross-account access" },
    { time: "2024-07-24T08:45:22Z", author: "Siddharth Ponnapalli", title: "Configured RDS read replicas for high availability" },
    { time: "2024-07-24T10:12:09Z", author: "Siddharth Ponnapalli", title: "Added CloudFront invalidation for cache management" },
    { time: "2024-07-25T11:34:56Z", author: "Siddharth Ponnapalli", title: "Updated Route 53 health checks for better uptime monitoring" },
    { time: "2024-07-25T13:45:22Z", author: "Siddharth Ponnapalli", title: "Enhanced S3 bucket encryption settings for data security" },
    { time: "2024-07-26T09:14:33Z", author: "Siddharth Ponnapalli", title: "Configured ELB for load balancing EC2 instances" },
    { time: "2024-07-26T10:22:12Z", author: "Siddharth Ponnapalli", title: "Updated IAM policies for better resource access control" },
    { time: "2024-07-27T11:55:47Z", author: "Siddharth Ponnapalli", title: "Enhanced CloudWatch dashboards for better visibility" },
    { time: "2024-07-27T14:33:29Z", author: "Siddharth Ponnapalli", title: "Configured EC2 instance user data for automation" }
];


function RenderContent({
    activeStage,
    run,
}: {
    activeStage: string;
    run: Table<'digger_runs'>;
}) {
    if (activeStage === 'plan') {
        return (
            <div className="flex-1 flex flex-col h-[500px]">
                <h3 className="text-lg font-semibold mb-2">Terraform Plan Output</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto flex-1 max-h-[600px] text-sm whitespace-pre-wrap">
                    {run.terraform_output || 'No plan output available'}
                </pre>
            </div>
        );
    } else if (activeStage === 'apply') {
        if (run.status === 'pending_approval' || run.status === 'rejected') {
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
                    {logEntries.map((log, index) => (
                        <div className="flex gap-4 overflow-hidden text-ellipsis whitespace-nowrap break-all" key={log.time + index}>
                            <p className="text-green-500">{log.time}</p>
                            <p className="text-muted-foreground">{log.author}</p>
                            <p className="text-white font-bold">{log.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}


export const ProjectRunDetails: React.FC<{
    run: Table<'digger_runs'>,
    loggedInUser: Table<'user_profiles'>
    isUserOrgAdmin: boolean
}> = ({ run, loggedInUser, isUserOrgAdmin }) => {
    const router = useRouter();
    const [activeStage, setActiveStage] = useState<'plan' | 'apply'>('plan');
    const [applyLogs, setApplyLogs] = useState<string[]>([]);

    useEffect(() => {
        if (run.status === 'pending_apply') {
            const timer = setTimeout(async () => {
                await changeRunStatus(run.id, 'applied');
                setActiveStage('apply');
                router.refresh();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [run.status, run.id, router]);

    useEffect(() => {
        if (run.apply_logs) {
            setApplyLogs(run.apply_logs.split('\n'));
        }
    }, [run.apply_logs]);

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
                <CardContent className="bg-muted/50 pt-4 border rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Run Details</h2>
                    <div className="space-y-2">
                        <DetailItem label="Triggered at" value={new Date(run.created_at).toLocaleString()} />
                        <DetailItem label="Project" value={run.project_name || 'N/A'} />
                        <DetailItem label="Commit" value={run.commit_id} />
                        <DetailItem label="Trigger type" value={run.triggertype} />
                        <DetailItem label="Status" value={
                            <Badge className={`${statusColors[run.status]} pointer-events-none`}>
                                {run.status.toUpperCase()}
                            </Badge>
                        } />
                        {run.pr_number && <DetailItem label="PR Number" value={run.pr_number.toString()} />}
                    </div>
                </CardContent>

                <div className="space-y-2 flex-grow pt-8">
                    <RunStage
                        icon={<GitPullRequest />}
                        name="Plan"
                        isActive={activeStage === 'plan'}
                        isComplete={run.status !== 'pending_approval'}
                        onClick={() => setActiveStage('plan')}
                    />
                    {run.status === 'pending_approval' && isUserOrgAdmin && (
                        <Card className="mt-4">
                            <CardContent className="pt-4">
                                <p className="mb-2 text-sm font-medium">Do you approve the proposed changes?</p>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => rejectMutation()} disabled={isRejecting}>
                                        {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reject'}
                                    </Button>
                                    <Button variant='default' onClick={() => approveMutation()} disabled={isApproving} className="bg-primary text-white">
                                        {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Approve'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <RunStage
                        icon={<Play />}
                        name="Apply"
                        isActive={activeStage === 'apply'}
                        isComplete={run.status === 'applied'}
                        isDisabled={run.status === 'pending_approval' || run.status === 'rejected'}
                        onClick={() => setActiveStage('apply')}
                    />

                    {run.status === 'pending_apply' && run.is_approved && (
                        <motion.div
                            className="mt-6 flex items-center justify-center p-24 bg-muted/50 rounded-lg w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Loader2 className="animate-spin mr-2" />
                            <T.Small>Applying changes...</T.Small>
                        </motion.div>
                    )}
                </div>
                {run.is_approved && run.status !== 'rejected' || 'pending_approval' && (
                    <T.Small className="flex items-center"><CheckCircle2 className="size-5 text-green-500 mr-2" /> Approved by: </T.Small>
                )}
                {run.status === 'rejected' && (
                    <p className="flex items-center"><XCircle className="text-red-500 mr-2" /> Rejected by: </p>
                )}
                {(run.status === 'pending_apply' || run.status === 'applied' || run.status === 'rejected') && (
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
                            <RenderContent activeStage={activeStage} run={run} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const RunStage: React.FC<{
    icon: React.ReactNode,
    name: string,
    isActive: boolean,
    isComplete: boolean,
    isDisabled?: boolean,
    onClick: () => void
}> = ({ icon, name, isActive, isComplete, isDisabled = false, onClick }) => (
    <motion.div
        className={`flex items-center justify-between space-x-2 p-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
            } ${isComplete ? '' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={isDisabled ? undefined : onClick}
    >
        <div className="flex items-center gap-2">
            {icon}
            <p className="text-sm">{name}</p>
        </div>
        {isActive && !isComplete && <DotFilledIcon className="ml-auto size-6" />}
        {isComplete && <CheckCircle2 className="ml-auto h-4 w-4" />}
    </motion.div>
);

const DetailItem: React.FC<{ label: string, value: string | React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-center space-x-2">
        <p className="text-sm text-[var(--muted-foreground)]">{label}:</p>
        {typeof value === 'string' ? <p className="text-sm">{value}</p> : value}
    </div>
);