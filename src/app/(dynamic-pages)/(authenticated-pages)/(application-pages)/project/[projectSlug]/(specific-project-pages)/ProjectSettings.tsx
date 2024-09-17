'use client';

import { InputTags } from "@/components/InputTags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
    iac_type: "terraform" | "terragrunt" | "opentofu";
    workspace: string;
    workflow_file: string;
    include_patterns: string;
    exclude_patterns: string;
    labels: string[];
    managedState: boolean;
    is_drift_detection_enabled: boolean;
    drift_crontab: string;
};

export default function ProjectSettings({ project, repositoryName }: ProjectSettingsProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, formState: { isDirty } } = useForm<ProjectSettingsFormData>({
        defaultValues: {
            terraformWorkingDir: project.terraform_working_dir || '',
            iac_type: project.iac_type || 'terraform',
            workspace: project.workspace || 'default',
            workflow_file: project.workflow_file || 'digger_workflow.yml',
            labels: project.labels || [],
            managedState: project.is_managing_state || false,
            is_drift_detection_enabled: project.is_drift_detection_enabled || false,
            drift_crontab: project.drift_crontab || '',
        },
    });

    const updateProjectSettingsMutation = useSAToastMutation(
        async (data: ProjectSettingsFormData) => {
            const result = await updateProjectSettingsAction({
                projectId: project.id,
                terraformWorkingDir: data.terraformWorkingDir,
                iac_type: data.iac_type,
                workspace: data.workspace,
                workflow_file: data.workflow_file,
                include_patterns: data.include_patterns,
                exclude_patterns: data.exclude_patterns,
                labels: data.labels,
                managedState: data.managedState,
                is_drift_detection_enabled: data.is_drift_detection_enabled,
                drift_crontab: data.drift_crontab,
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
                            transition={{ duration: 0.15, delay: 0.4 }}
                        >
                            <Label htmlFor="iac_type">IAC type</Label>
                            <Controller
                                name="iac_type"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select IAC type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="terraform" className="rounded-lg">
                                                Terraform
                                            </SelectItem>
                                            <SelectItem value="terragrunt" className="rounded-lg">
                                                Terragrunt
                                            </SelectItem>
                                            <SelectItem value="opentofu" className="rounded-lg">
                                                Opentofu
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, delay: 0.4 }}
                        >
                            <Label htmlFor="workspace">Workspace</Label>
                            <Controller
                                name="workspace"
                                control={control}
                                render={({ field }) => (
                                    <Input id="workspace" {...field} />
                                )}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, delay: 0.4 }}
                        >
                            <Label htmlFor="workflow_file">Workflow file</Label>
                            <Controller
                                name="workflow_file"
                                control={control}
                                render={({ field }) => (
                                    <Input id="workflow_file" {...field} />
                                )}
                            />
                        </motion.div>

                        <div className="grid grid-cols-2 gap-6">

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.15, delay: 0.4 }}
                            >
                                <Label htmlFor="include_patterns">Include patterns</Label>
                                <Controller
                                    name="include_patterns"
                                    control={control}
                                    render={({ field }) => (
                                        <Input id="include_patterns" {...field} />
                                    )}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.15, delay: 0.4 }}
                            >
                                <Label htmlFor="Exclude patterns">Exclude patterns</Label>
                                <Controller
                                    name="exclude_patterns"
                                    control={control}
                                    render={({ field }) => (
                                        <Input id="exclude_patterns" {...field} />
                                    )}
                                />
                            </motion.div>

                        </div>

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


                        {/* Drift Detection */}
                        <div className="flex items-center gap-2">
                            <Label htmlFor="is_drift_detection_enabled">Drift Detection</Label>
                            <Controller
                                name="is_drift_detection_enabled"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        {/* Input to set the drift detection crontab */}
                        <div>
                            <Label htmlFor="drift_crontab">Drift Detection Crontab</Label>
                            <Controller
                                name="drift_crontab"
                                control={control}
                                render={({ field }) => (
                                    <Input id="drift_crontab" {...field} />
                                )}
                            />
                        </div>

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