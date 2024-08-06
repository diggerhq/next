// TFVarsDetails.tsx
'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table } from "@/types";
import { motion } from "framer-motion";
import TFVarTable from "./TFVarTable";

type TFVarsDetailsProps = {
    projectId: string;
    orgId: string;
    isAllowedSecrets: boolean;
    initialEnvVars: Table<'env_vars'>[];
}

export default function TFVarsDetails({ projectId, orgId, isAllowedSecrets, initialEnvVars }: TFVarsDetailsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
        >
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Variables</CardTitle>
                    <CardDescription>Manage variables for project. They will be exposed in the job as environment variables.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TFVarTable
                        projectId={projectId}
                        orgId={orgId}
                        isAllowedSecrets={isAllowedSecrets}
                        envVars={initialEnvVars}
                    />
                </CardContent>
                <Separator />
                <CardFooter className="mt-6">
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