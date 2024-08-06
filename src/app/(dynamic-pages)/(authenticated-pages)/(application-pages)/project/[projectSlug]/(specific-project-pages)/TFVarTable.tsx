'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Table as DBTable } from "@/types";
import { motion } from 'framer-motion';
import { AlertTriangle, Plus } from 'lucide-react';
import { useState } from 'react';
import { z } from "zod";
import AddTFVarForm from "./AddTFVarForm";
import { BulkEditTFVars } from "./BulkEditTFVars";
import { TFVarTableRow } from "./TFVarTableRow";

export const envVarSchema = z.object({
    name: z.string(),
    value: z.string(),
    is_secret: z.boolean(),
});

const EmptyState: React.FC<{ onAddVariable: () => void }> = ({ onAddVariable }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className=" border-none bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <h3 className="text-2xl font-semibold mb-2">No Environment Variables Yet</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Add your first environment variable to get started. These variables will be available in your project's runtime.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button onClick={onAddVariable} size="lg">
                            <Plus className="mr-2 h-4 w-4" /> Add Environment Variable
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
};


type TFVarTableProps = {
    envVars: DBTable<'env_vars'>[];
    projectId: string;
    orgId: string;
    isAllowedSecrets: boolean;
};

export default function TFVarTable({ projectId, orgId, isAllowedSecrets, envVars }: TFVarTableProps) {
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const initialBulkEditValue = JSON.stringify(
        envVars.filter(envVar => !envVar.is_secret).map(envVar => ({ name: envVar.name, value: envVar.value })),
        null,
        2
    )

    const [showAddForm, setShowAddForm] = useState(false);

    if (envVars.length === 0 && !showAddForm) {
        return <EmptyState onAddVariable={() => setShowAddForm(true)} />;
    }

    return (
        <div className="space-y-4">
            {isBulkEditing ? (
                <BulkEditTFVars
                    projectId={projectId}
                    organizationId={orgId}
                    initialBulkEditValue={initialBulkEditValue}
                    setIsBulkEditing={setIsBulkEditing}
                />
            ) : (
                <>
                    <Table>
                        {envVars.length > 0 && (
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Secret</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Copy</TableHead>
                                    <TableHead>Edit</TableHead>
                                    <TableHead>Delete</TableHead>
                                </TableRow>
                            </TableHeader>
                        )}
                        <TableBody>
                            {envVars
                                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                                .map((envVar) => (
                                    <TFVarTableRow key={envVar.id} id={envVar.id} envVar={envVar} projectId={projectId} organizationId={orgId} />
                                ))}
                        </TableBody>
                    </Table>

                    {isAllowedSecrets ? (
                        <AddTFVarForm isAllowedSecrets={isAllowedSecrets} projectId={projectId} organizationId={orgId} envVarNames={envVars.map(envVar => envVar.name)} />
                    ) : (
                        <div className="mt-4 flex justify-start">
                            <span className="flex items-center text-orange-400">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                <em className="text-sm italic">
                                    To enable secrets creation, configure Secrets Key in your Organisation Settings
                                </em>
                            </span>
                        </div>)}
                </>
            )}

            {envVars.length > 0 && (
                <>
                    <Separator className="my-4" />
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold">Bulk Edit Environment Variables</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Edit all environment variables at once in JSON format. Be careful with this operation.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="secondary" className="w-full" onClick={() => setIsBulkEditing(true)}>
                                {isBulkEditing ? 'Cancel Bulk Edit' : 'Bulk Edit'}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}