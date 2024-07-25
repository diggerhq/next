'use client';

import { InputTags } from "@/components/InputTags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectSettingsAction } from "@/data/user/projects";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { Tables } from "@/lib/database.types";
import { motion } from "framer-motion";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

type ProjectSettingsProps = {
    project: Tables<'projects'>;
    repositoryName: string | null;
};

type ProjectSettingsFormData = {
    terraformWorkingDir: string;
    labels: string[];
    managedState: boolean;
};

export default function ProjectSettings({ project, repositoryName }: ProjectSettingsProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, formState: { isDirty } } = useForm<ProjectSettingsFormData>({
        defaultValues: {
            terraformWorkingDir: project.terraform_working_dir || '',
            labels: project.labels || [],
            managedState: project.is_managing_state || false,
        },
    });

    const updateProjectSettingsMutation = useSAToastMutation(
        async (data: ProjectSettingsFormData) => {
            const result = await updateProjectSettingsAction({
                projectId: project.id,
                terraformWorkingDir: data.terraformWorkingDir,
                labels: data.labels,
                managedState: data.managedState,
            });
            return result;
        },
        {
            loadingMessage: "Updating project settings...",
            successMessage: "Project settings updated successfully!",
            errorMessage: "Failed to update project settings",
        }
    );

    const onSubmit = async (data: ProjectSettingsFormData) => {
        setIsSubmitting(true);
        try {
            await updateProjectSettingsMutation.mutateAsync(data);
        } catch (error) {
            console.error("Error updating project settings:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
        >
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Project Settings</CardTitle>
                    <CardDescription>Manage settings for your project</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.15, delay: 0.1 }}
                            >
                                <Label htmlFor="name">Project Name</Label>
                                <Input id="name" value={project.name} disabled />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.15, delay: 0.2 }}
                            >
                                <Label htmlFor="repo">Repository</Label>
                                <Input id="repo" value={repositoryName || 'N/A'} disabled />
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, delay: 0.3 }}
                            className="flex items-center space-x-2"
                        >
                            <Controller
                                name="managedState"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="managedState"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled
                                    />
                                )}
                            />
                            <Label htmlFor="managedState">Managed State</Label>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, delay: 0.4 }}
                        >
                            <Label htmlFor="terraformWorkingDir">Terraform Working Directory</Label>
                            <Controller
                                name="terraformWorkingDir"
                                control={control}
                                render={({ field }) => (
                                    <Input id="terraformWorkingDir" {...field} />
                                )}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, delay: 0.5 }}
                        >
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
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, delay: 0.6 }}
                            className="flex justify-end"
                        >
                            <Button
                                type="submit"
                                disabled={!isDirty || isSubmitting || updateProjectSettingsMutation.isLoading}
                            >
                                {isSubmitting || updateProjectSettingsMutation.isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </motion.div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}