"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { T } from "@/components/ui/Typography";
import { addTFVar } from "@/data/admin/env-vars";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";




export default function AddTFVarForm({
    projectId,
    organizationId,
    isAllowedSecrets,
    envVarNames,
}: {
    projectId: string;
    organizationId: string;
    isAllowedSecrets: boolean;
    envVarNames: string[];
}) {
    const [showForm, setShowForm] = useState(false);

    const addTFVarSchema = z.object({
        name: z.string()
            .min(1, "Name is required")
            .refine((value) => !envVarNames.includes(value), {
                message: "Environment variable name already exists",
            }),
        value: z.string().min(1, "Value is required"),
        is_secret: z.boolean(),
    });

    const { mutate: addEnvVar, isLoading: isAddingEnvVar } = useSAToastMutation(
        async (data: z.infer<typeof addTFVarSchema>) =>
            addTFVar(data.name, data.value, data.is_secret, projectId, organizationId),
        {
            loadingMessage: "Adding environment variable...",
            successMessage: "Environment variable added!",
            errorMessage: "Failed to add environment variable",
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        }
    )

    const { handleSubmit, register, reset, control, watch, formState: { errors } } = useForm<z.infer<typeof addTFVarSchema>>({
        resolver: zodResolver(addTFVarSchema),
        defaultValues: {
            name: '',
            value: '',
            is_secret: false,
        },
    });

    const onSubmit = (data: z.infer<typeof addTFVarSchema>) => {
        addEnvVar(data);
    }

    return (
        <>
            {showForm ? (
                <Card className="p-5 mt-4 bg-muted/50 rounded-lg">
                    <T.H4 className=" mt-1">Add a new environment variable</T.H4>
                    <T.P className="mt-0 pt-0 mb-4">Enter the environment variable details. These variables will be assigned to your project</T.P>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                            <div className="relative">
                                <Label htmlFor="varName">Variable Name</Label>
                                <Input
                                    id="varName"
                                    placeholder="e.g., API_KEY"
                                    {...register('name')}
                                    onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                                    className={errors.name ? "border-destructive" : ""}
                                />
                                {errors.name && <p className="text-destructive text-sm mt-1 absolute -bottom-6">{errors.name.message}</p>}
                            </div>
                            <div className="relative">
                                <Label htmlFor="varValue">Variable Value</Label>
                                <Controller
                                    name="value"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="varValue"
                                            type={watch('is_secret') ? "password" : "text"}
                                            placeholder="Enter value"
                                            {...field}
                                            className={errors.value ? "border-destructive" : ""}
                                        />
                                    )}
                                />
                                {errors.value && <p className="text-destructive text-sm mt-1 absolute -bottom-6">{errors.value.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="varType">Variable Type</Label>
                                <Controller
                                    name="is_secret"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ? "secret" : "plain_text"}
                                            onValueChange={(value) => field.onChange(value === "secret")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="plain_text">Plain Text</SelectItem>
                                                <SelectItem value="secret">Secret</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end w-full">
                            <Button type="submit" variant='outline' disabled={isAddingEnvVar}>
                                <Plus className="h-4 w-4 mr-2" />
                                {isAddingEnvVar ? 'Adding...' : 'Add Variable'}
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : (
                <div className="mt-4 flex justify-end w-full" >
                    <Button onClick={() => setShowForm(true)} variant='outline' disabled={!isAllowedSecrets} >
                        <Plus className="h-4 w-4 mr-2" />
                        Add a new environment variable
                    </Button>
                </div>
            )}
        </>
    );
}