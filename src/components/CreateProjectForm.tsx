'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { createProjectAction } from "@/data/user/projects";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { generateSlug } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Check, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { InputTags } from "./InputTags";
import { T } from "./ui/Typography";

const MotionCard = motion(Card);

const createProjectFormSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    repository: z.number().int().positive("Repository ID must be a positive integer"),
    terraformDir: z.string().min(1, "Terraform working directory is required"),
    managedState: z.boolean(),
    labels: z.array(z.string()),
});

type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;

const repositories = [
    { id: 12, name: 'Repository 1' },
    { id: 123, name: 'Repository 2' },
    { id: 41, name: 'Repository 3' },
    { id: 24, name: 'Repository 4' },
    { id: 124, name: 'Repository 5' },
];

export default function CreateProjectForm({ organizationId }: { organizationId: string }) {
    const [selectedRepo, setSelectedRepo] = useState(repositories[0].id);
    const router = useRouter();

    const { control, handleSubmit, setValue, watch } = useForm<CreateProjectFormData>({
        resolver: zodResolver(createProjectFormSchema),
        defaultValues: {
            name: "",
            repository: repositories[0].id,
            terraformDir: "",
            managedState: true,
            labels: [],
        },
    });

    const createProjectMutation = useSAToastMutation(
        async (data: CreateProjectFormData) => {
            const slug = generateSlug(data.name);
            return await createProjectAction({
                organizationId,
                name: data.name,
                slug,
                repoId: data.repository,
                terraformWorkingDir: data.terraformDir,
                isManagingState: data.managedState,
                labels: data.labels,
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
    );

    const onSubmit = (data: CreateProjectFormData) => {
        createProjectMutation.mutate(data);
    };



    return (
        <div className="p-6 max-w-4xl mx-auto">
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)(e);
            }}>
                {/* {Object.entries(watch()).map(([key, value]) => (
                    <div key={key}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                    </div>
                ))} */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <T.H3>Create new Project</T.H3>
                        <T.P className="text-muted-foreground">Create a new project within your organization.</T.P>
                    </div>
                    <div className="flex space-x-2 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={createProjectMutation.isLoading}>
                            {createProjectMutation.isLoading ? "Creating..." : "Create Project"}
                        </Button>
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
                                    <Input
                                        id="name"
                                        placeholder="Enter workspace name"
                                        className="mt-1"
                                        {...field}
                                    />
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
                                        onClick={() => {
                                            setSelectedRepo(repo.id);
                                            setValue("repository", repo.id);
                                        }}
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
                            <Controller
                                name="terraformDir"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        id="terraformDir"
                                        placeholder="Enter directory path"
                                        className="mt-1"
                                        {...field}
                                    />
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
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="managedState"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="managedState"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="managedState">Managed State</Label>
                            </div>
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
            </form>
        </div>
    );
}