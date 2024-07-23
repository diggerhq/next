'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Adjust the import path as needed
import { upsertTFVarsByProjectId } from "@/data/user/runs";
import { Json } from '@/lib/database.types'; // Import the Json type from your database types
import { motion } from "framer-motion";
import { useState } from "react";
import TFVarTable from "./TFVarTable";

type TFVarsDetailsProps = {
    tfvarsdata: {
        id: string;
        project_id: string;
        tfvars: Json;
        updated_at: string;
    } | null;
    projectId: string;
}

function parseTFVars(tfvars: Json): string {
    if (typeof tfvars === 'string') {
        return tfvars;
    } else if (tfvars === null) {
        return '[]';
    } else {
        return JSON.stringify(tfvars);
    }
}

export default function TFVarsDetails({ tfvarsdata, projectId }: TFVarsDetailsProps) {
    const [tfvars, setTfvars] = useState<string>(
        tfvarsdata ? parseTFVars(tfvarsdata.tfvars) : '[]'
    );

    const handleUpdate = async (updatedTFVarsJSON: string): Promise<void> => {
        try {
            await upsertTFVarsByProjectId(projectId, { tfvars: updatedTFVarsJSON });
            setTfvars(updatedTFVarsJSON);
        } catch (error) {
            console.error("Failed to update TF variables:", error);
            throw error;
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
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: 0.1 }}
                >
                    <CardHeader>
                        <CardTitle>Terraform Variables</CardTitle>
                        <CardDescription>Manage Terraform variables for project</CardDescription>
                    </CardHeader>
                </motion.div>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: 0.2 }}
                    >
                        <TFVarTable initialVariables={tfvars} onUpdate={handleUpdate} />
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}