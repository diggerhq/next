'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProjectAction } from "@/data/user/projects";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { generateSlug } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { AlertCircle, Briefcase, Github, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { InputTags } from "./InputTags";
import { T } from "./ui/Typography";
import { Switch } from "./ui/switch";

const MotionCard = motion(Card);

const createProjectFormSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    repository: z.number().int().positive("Please select a repository"),
    terraformDir: z.string().min(1, "Terraform working directory is required"),
    labels: z.array(z.string()),
    managedState: z.boolean().default(true),
    teamId: z.number().int().positive().nullable(),
    is_drift_detection_enabled: z.boolean().default(false),
    drift_crontab: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;

type Repository = {
    id: number;
    repo_full_name: string | null;
};

type Team = {
    id: number;
    name: string;
};

type CreateProjectFormProps = {
    organizationId: string;
    repositories: Repository[];
    teams: Team[];
    teamId: number | undefined;
};

export default function CreateProjectForm({ organizationId, repositories, teams, teamId }: CreateProjectFormProps) {
    const router = useRouter();

    const githubAppSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateProjectFormData>({
        resolver: zodResolver(createProjectFormSchema),
        defaultValues: {
            name: "",
            repository: repositories[0]?.id || 0,
            terraformDir: "",
            managedState: true,
            labels: [],
            teamId: teamId || null,
            is_drift_detection_enabled: false,
            drift_crontab: '',
        },
    });

    const createProjectMutation = useSAToastMutation(
        async (data: CreateProjectFormData) => {
            const slug = generateSlug(data.name);
            return await createProjectAction({
                organizationId,
                teamId: data.teamId,
                name: data.name,
                slug,
                repoId: data.repository,
                managedState: data.managedState,
                terraformWorkingDir: data.terraformDir,
                labels: data.labels,
                is_drift_detection_enabled: data.is_drift_detection_enabled,
                drift_crontab: data.drift_crontab || '',
            });
        },
        {
            loadingMessage: "Creating project...",
            successMessage: "Project created!",
            errorMessage: "Failed to create project",
            onSuccess: (response) => {
                if (response.status === "success" && response.data) {
                    router.push(`/project/${response.data.slug}`);
                }
            },
        },
    )


    // isSubmitting is used to disable the submit button while the form is being submitted
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = (data: CreateProjectFormData) => {
        setIsSubmitting(true);
        createProjectMutation.mutate(data);
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <form onSubmit={handleFormSubmit}>
                <div className="mb-6 flex justify-start items-center">
                    <div>
                        <T.H3>Create new Project</T.H3>
                        <T.P className="text-muted-foreground">Create a new project within your organization.</T.P>
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
                        <div>
                            <Label htmlFor="name">Project Name *</Label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            placeholder="Enter project name"
                                            className={`mt-1 ${errors.name ? 'border-destructive' : ''}`}
                                            {...field}
                                        />
                                        {errors.name && (
                                            <div className="flex items-center mt-1 text-destructive">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                <span className="text-sm">{errors.name.message}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
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
                        <Link
                            href={`https://github.com/apps/${githubAppSlug}/installations/select_target?organization_id=${organizationId}`}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                type="button"
                                variant='secondary'
                                size='sm'
                                className="gap-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <GitHubLogoIcon className="h-4 w-4 mr-1" />
                                Configure Github
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {repositories.length > 0 ? (
                            <Controller
                                name="repository"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                                            <SelectTrigger className={`w-full ${errors.repository ? 'border-destructive' : ''}`}>
                                                <SelectValue placeholder="Select a repository" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {repositories.map((repo) => (
                                                    <SelectItem key={repo.id} value={repo.id.toString()}>
                                                        <div className="flex items-center">
                                                            <Github className="mr-2 h-4 w-4" />
                                                            <span>{repo.repo_full_name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.repository && (
                                            <div className="flex items-center mt-1 text-destructive">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                <span className="text-sm">{errors.repository.message}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <div className="bg-muted/50 rounded-full p-4 inline-block">
                                    <Github className="mx-auto size-8 text-muted-foreground" />
                                </div>
                                <T.H4 className="mb-1 mt-4">No Repositories Found</T.H4>
                                <T.P className="text-muted-foreground mb-4">
                                    It looks like there are no repositories.
                                </T.P>
                            </div>
                        )}
                    </CardContent>
                </MotionCard>
                {teams.length !== 0 && (
                    <MotionCard
                        className="mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <CardHeader className="flex flex-col space-y-0">
                            <CardTitle className="text-lg mb-0">Select a Team</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground mt-0">Choose the team for your project or create it at the organization level</CardDescription>
                        </CardHeader>
                        <CardContent>

                            <Controller
                                name="teamId"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Select onValueChange={(value) => {
                                            if (value === 'null') {
                                                field.onChange(null);
                                            } else {
                                                field.onChange(parseInt(value));
                                            }
                                        }} value={field.value?.toString() || "null"}

                                        >
                                            <SelectTrigger className={`w-full ${errors.teamId ? 'border-destructive' : ''}`}>
                                                <SelectValue placeholder="Select a team" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">
                                                    <div className="flex items-center">
                                                        <Briefcase className="mr-2 h-4 w-4" />
                                                        <span>Create at organization level</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectSeparator />
                                                <SelectGroup>
                                                    <SelectLabel className='ml-0'>My teams</SelectLabel>
                                                    {teams.map((team) => (
                                                        <SelectItem key={team.id} value={team.id.toString()}>
                                                            <div className="flex items-center">
                                                                <Users className="mr-2 h-4 w-4" />
                                                                <span>{team.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errors.teamId && (
                                            <div className="flex items-center mt-1 text-destructive">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                <span className="text-sm">{errors.teamId.message}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        </CardContent>
                    </MotionCard>
                )}

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
                            <Controller
                                name="terraformDir"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Input
                                            id="terraformDir"
                                            placeholder="Enter directory path"
                                            className={`mt-1 ${errors.terraformDir ? 'border-destructive' : ''}`}
                                            {...field}
                                        />
                                        {errors.terraformDir && (
                                            <div className="flex items-center mt-1 text-destructive">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                <span className="text-sm">{errors.terraformDir.message}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </CardContent>
                </MotionCard>

                <MotionCard
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <CardHeader>
                        <div className="flex flex-col">
                            <CardTitle className="text-lg ">Additional Settings</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Configure additional project settings</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="labels">Labels</Label>
                                <Controller
                                    name="labels"
                                    control={control}
                                    render={({ field }) => (
                                        <InputTags
                                            id="labels"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Add labels"
                                            className="mt-1"
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </MotionCard>

                <MotionCard
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <CardHeader>
                        <div className="flex flex-col">
                            <CardTitle className="text-lg">Drift Detection</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Configure drift detection settings</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="is_drift_detection_enabled"
                                    control={control}
                                    render={({ field }) => (
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            id="is_drift_detection_enabled"
                                        />
                                    )}
                                />
                                <Label htmlFor="is_drift_detection_enabled">Enable Drift Detection</Label>
                            </div>
                            {watch('is_drift_detection_enabled') && (
                                <div>
                                    <Label htmlFor="drift_crontab">Drift Detection Schedule (Crontab)</Label>
                                    <Controller
                                        name="drift_crontab"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="drift_crontab"
                                                placeholder="Enter crontab schedule (e.g., 0 0 * * *)"
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </MotionCard>
                <div className="flex justify-end w-full gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting || createProjectMutation.isLoading}>
                        {isSubmitting || createProjectMutation.isLoading ? "Creating..." : "Create Project"}
                    </Button>
                </div>
            </form>
        </div>
    );
}