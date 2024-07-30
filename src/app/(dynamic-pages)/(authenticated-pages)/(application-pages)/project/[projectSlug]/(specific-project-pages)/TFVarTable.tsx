'use client'

import { T } from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { tfvarsOnBulkUpdate, tfvarsOnDelete, tfvarsOnUpdate } from "@/data/user/tfvars";
import { EnvVar } from "@/types/userTypes";
import { motion } from 'framer-motion';
import { Copy, Edit, LockKeyhole, Plus, Save, Trash, Unlock } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type TFVarTableProps = {
    envVars: EnvVar[];
    projectId: string;
};

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

export default function TFVarTable({ projectId, envVars }: TFVarTableProps) {
    const [editingVar, setEditingVar] = useState<{ originalName: string, currentVar: EnvVar } | null>(null);
    const [newVar, setNewVar] = useState<Omit<EnvVar, 'updated_at'>>({ name: '', value: '', is_secret: false });
    const [bulkEditMode, setBulkEditMode] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const router = useRouter();

    const handleEdit = (envVar: EnvVar) => {
        setEditingVar({
            originalName: envVar.name,
            currentVar: {
                ...envVar,
                value: envVar.is_secret ? '' : envVar.value
            }
        });
    };

    const handleSave = async () => {
        if (editingVar) {
            if (editingVar.currentVar.name.toLowerCase() !== editingVar.originalName.toLowerCase() &&
                envVars.some(v => v.name.toLowerCase() === editingVar.currentVar.name.toLowerCase())) {
                toast.error('A variable with this name already exists');
                return;
            }
            setIsLoading(true);
            try {
                await tfvarsOnUpdate(
                    editingVar.originalName,
                    editingVar.currentVar.name,
                    editingVar.currentVar.value,
                    editingVar.currentVar.is_secret,
                    projectId
                );
                toast.success('Variable updated successfully');
                setEditingVar(null);
                router.refresh();
            } catch (error) {
                toast.error('Failed to update variable');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAddNew = async () => {
        if (newVar.name && newVar.value) {
            if (envVars.some(v => v.name.toLowerCase() === newVar.name.toLowerCase())) {
                toast.error('A variable with this name already exists');
                return;
            }
            setIsLoading(true);
            try {
                await tfvarsOnUpdate(newVar.name, newVar.name, newVar.value, newVar.is_secret, projectId);
                toast.success('New variable added successfully');
                setNewVar({ name: '', value: '', is_secret: false });
                setShowAddForm(false);
                router.refresh();
            } catch (error) {
                toast.error('Failed to add new variable');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteVar = async (name: string) => {
        setIsLoading(true);
        try {
            await tfvarsOnDelete(name, projectId);
            toast.success('Variable deleted successfully');
            router.refresh();
        } catch (error) {
            toast.error('Failed to delete variable');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkEdit = async () => {
        try {
            const parsedVars = JSON.parse(bulkEditValue);
            if (Array.isArray(parsedVars)) {
                const names = parsedVars.map(v => v.name.toLowerCase());
                if (new Set(names).size !== names.length) {
                    toast.error('Duplicate variable names are not allowed');
                    return;
                }

                setIsLoading(true);
                await tfvarsOnBulkUpdate(parsedVars, projectId);
                toast.success('Bulk update successful');
                setBulkEditMode(false);
                router.refresh();
            }
        } catch (error) {
            toast.error('Error parsing JSON or updating variables');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleBulkEdit = () => {
        if (!bulkEditMode) {
            const nonSecretVars = envVars.filter(v => !v.is_secret).map(({ name, value }) => ({ name, value }));
            setBulkEditValue(JSON.stringify(nonSecretVars, null, 2));
        }
        setBulkEditMode(!bulkEditMode);
    };

    const handleCopy = (envVar: EnvVar) => {
        const copyText = JSON.stringify({
            name: envVar.name,
            value: envVar.is_secret ? '********' : envVar.value,
            updated_at: envVar.updated_at
        }, null, 2);
        navigator.clipboard.writeText(copyText);
        toast.success('Copied to clipboard');
    };

    const handleCopyAll = () => {
        const copyText = JSON.stringify(envVars.map(v => ({
            ...v,
            value: v.is_secret ? '********' : v.value
        })), null, 2);
        navigator.clipboard.writeText(copyText);
        toast.success('All variables copied to clipboard');
    };

    if (bulkEditMode) {
        return (
            <div className="space-y-4">
                <Textarea
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    rows={24}
                    className="font-mono"
                />
                <div className="flex gap-2 w-full justify-end">
                    <Button variant="outline" onClick={toggleBulkEdit}>Cancel</Button>
                    <Button onClick={handleBulkEdit} disabled={isLoading}>
                        {isLoading ? 'Applying...' : 'Apply Bulk Edit'}
                    </Button>
                </div>
            </div>
        );
    }
    if (envVars.length === 0 && !showAddForm) {
        return <EmptyState onAddVariable={() => setShowAddForm(true)} />;
    }

    return (
        <div className="space-y-4">
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
                    {envVars.map((envVar, index) => (
                        <TableRow key={envVar.name}>
                            <TableCell>
                                {editingVar && editingVar.originalName === envVar.name ? (
                                    <Input
                                        value={editingVar.currentVar.name}
                                        onChange={(e) => setEditingVar({
                                            ...editingVar,
                                            currentVar: { ...editingVar.currentVar, name: e.target.value.toUpperCase() }
                                        })}
                                    />
                                ) : (
                                    envVar.name
                                )}</TableCell>
                            <TableCell>
                                {editingVar && editingVar.originalName === envVar.name ? (
                                    <Input
                                        type={editingVar.currentVar.is_secret ? "password" : "text"}
                                        value={editingVar.currentVar.value}
                                        onChange={(e) => setEditingVar({
                                            ...editingVar,
                                            currentVar: { ...editingVar.currentVar, value: e.target.value }
                                        })}
                                        placeholder={editingVar.currentVar.is_secret ? "Enter new secret value" : ""}
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
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(envVar)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            <TableCell>
                                {editingVar && editingVar.originalName === envVar.name ? (
                                    <Button variant="ghost" size="icon" onClick={handleSave} disabled={isLoading}>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(envVar)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteVar(envVar.name)} disabled={isLoading}>
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {(showAddForm || envVars.length === 0) && (
                <Card className="p-5 mt-4 bg-muted/50 rounded-lg">
                    <T.H4 className=" mt-1">Add a new environment variable</T.H4>
                    <T.P className="mt-0 pt-0 mb-4">Enter the environment variable details. These variables will be assigned to your project</T.P>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div>
                            <Label htmlFor="varName">Variable Name</Label>
                            <Input
                                id="varName"
                                placeholder="e.g., API_KEY"
                                value={newVar.name}
                                onChange={(e) => setNewVar({ ...newVar, name: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="varValue">Variable Value</Label>
                            <Input
                                id="varValue"
                                type={newVar.is_secret ? "password" : "text"}
                                placeholder="Enter value"
                                value={newVar.value}
                                onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="varType">Variable Type</Label>
                            <Select
                                value={newVar.is_secret ? "secret" : "default"}
                                onValueChange={(value) => setNewVar({ ...newVar, is_secret: value === "secret" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="secret">Secret</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleAddNew} disabled={isLoading || !newVar.name || !newVar.value}>
                            <Plus className="h-4 w-4 mr-2" />
                            {isLoading ? 'Adding...' : 'Add Variable'}
                        </Button>
                    </div>
                </Card>
            )}

            {envVars.length > 0 && (
                <>
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? 'Cancel' : 'Add New Variable'}
                        </Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold">Bulk Edit Environment Variables</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Edit all environment variables at once in JSON format. Be careful with this operation.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="secondary" className="w-full" onClick={toggleBulkEdit}>
                                {bulkEditMode ? 'Cancel Bulk Edit' : 'Bulk Edit'}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}