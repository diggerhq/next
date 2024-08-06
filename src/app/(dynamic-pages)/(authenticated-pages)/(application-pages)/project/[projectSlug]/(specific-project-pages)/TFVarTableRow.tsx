'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { deleteTFVar, updateTFVar } from "@/data/admin/env-vars";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { Table } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Edit, LockKeyhole, Save, Trash, Unlock } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { envVarSchema } from "./TFVarTable";


export function TFVarTableRow({ id, projectId, envVar, organizationId }: { id: string, projectId: string, envVar: Table<'env_vars'>, organizationId: string }) {
    const [isEditingVar, setIsEditingVar] = useState<boolean>(false);

    const { mutate: updateEnvVar, isLoading: isUpdatingEnvVar } = useSAToastMutation(
        async (data: Table<'env_vars'>) =>
            updateTFVar(data, envVar.is_secret, projectId, organizationId),
        {
            loadingMessage: "Updating environment variable...",
            successMessage: "Environment variable updated!",
            errorMessage: "Failed to update environment variable",
            onSuccess: (response) => {
                if (response.status === 'success') {
                    setIsEditingVar(false);
                } else {
                    setIsEditingVar(false);
                }
            },
        }
    )

    const { mutate: deleteEnvVar, isLoading: isDeletingEnvVar } = useSAToastMutation(
        async () =>
            deleteTFVar(projectId, id),
        {
            loadingMessage: "Deleting environment variable...",
            successMessage: "Environment variable deleted!",
            errorMessage: "Failed to delete environment variable",
            onSuccess: () => {
                setIsEditingVar(false);
            },
        }
    )

    const { handleSubmit, register, reset } = useForm<z.infer<typeof envVarSchema>>({
        resolver: zodResolver(envVarSchema),
        defaultValues: {
            name: envVar.name,
            value: envVar.is_secret ? '' : envVar.value,
            is_secret: envVar.is_secret,
        },
    });

    const onSubmit = (data: z.infer<typeof envVarSchema>) => {
        updateEnvVar({ ...data, id, project_id: projectId, updated_at: new Date().toISOString() });
    }

    return (
        <TableRow>
            <TableCell>
                {isEditingVar ? (
                    <Input
                        {...register("name")}
                        defaultValue={envVar.name}
                        className="w-full"
                    />
                ) : (
                    envVar.name
                )}
            </TableCell>
            <TableCell>
                {isEditingVar ? (
                    <Input
                        type={envVar.is_secret ? "password" : "text"}
                        defaultValue={envVar.is_secret ? '' : envVar.value}
                        {...register("value")}
                        placeholder={envVar.is_secret ? "Enter new secret value" : ""}
                        className="w-full"
                    />
                ) : (
                    <span>{envVar.is_secret ? '********' : envVar.value}</span>
                )}
            </TableCell>
            <TableCell>
                {envVar.is_secret ? <LockKeyhole className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </TableCell>
            <TableCell>{moment(envVar.updated_at).fromNow()}</TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({ name: envVar.name, value: envVar.value }));
                    toast.success("Copied to clipboard");
                }}>
                    <Copy className="h-4 w-4" />
                </Button>
            </TableCell>
            <TableCell>
                {isEditingVar ? (
                    <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={handleSubmit(onSubmit)} disabled={isUpdatingEnvVar}>
                            <Save className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setIsEditingVar(true);
                            reset({
                                name: envVar.name,
                                value: envVar.is_secret ? '' : envVar.value,
                                is_secret: envVar.is_secret,
                            });
                        }}
                        disabled={isUpdatingEnvVar}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
            </TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" onClick={() => deleteEnvVar()} disabled={isDeletingEnvVar}>
                    <Trash className="h-4 w-4 text-destructive" />
                </Button>
            </TableCell>
        </TableRow>
    );
}