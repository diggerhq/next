'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EnvVar } from "@/types/userTypes";
import { motion } from "framer-motion";
import TFVarTable from "./TFVarTable";

type TFVarsDetailsProps = {
    tfvarsdata: {
        id: string;
        project_id: string;
        tfvars: EnvVar[];
        updated_at: string;
    };
    onUpdate: (oldName: string, newName: string, value: string, isSecret: boolean) => Promise<EnvVar[]>;
    onDelete: (name: string) => Promise<EnvVar[]>;
    onBulkUpdate: (vars: EnvVar[]) => Promise<EnvVar[]>;
}

export default function TFVarsDetails({ tfvarsdata, onUpdate, onDelete, onBulkUpdate }: TFVarsDetailsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
        >
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Terraform Variables</CardTitle>
                    <CardDescription>Manage Terraform variables for project</CardDescription>
                </CardHeader>
                <CardContent>
                    <TFVarTable
                        envVars={tfvarsdata.tfvars}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onBulkUpdate={onBulkUpdate}
                    />
                </CardContent>
                <CardFooter>
                    <Alert variant='default' className="bg-muted/50" >
                        <AlertTitle>PROTIP</AlertTitle>
                        <AlertDescription>
                            If you want to use these env variables directly in your terraform variables prefix them with TF_VAR_xxx
                        </AlertDescription>
                    </Alert>
                </CardFooter>
            </Card>
        </motion.div>
    );
}