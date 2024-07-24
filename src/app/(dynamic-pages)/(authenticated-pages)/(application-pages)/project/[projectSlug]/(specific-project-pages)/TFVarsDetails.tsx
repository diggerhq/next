'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    onUpdate: (name: string, value: string, isSecret: boolean) => Promise<EnvVar[]>;
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
            </Card>
        </motion.div>
    );
}