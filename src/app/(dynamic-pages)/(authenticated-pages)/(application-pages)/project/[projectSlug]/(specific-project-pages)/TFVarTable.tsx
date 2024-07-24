'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EnvVar } from "@/types/userTypes";
import { Copy, Edit, Trash } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type TFVarTableProps = {
    envVars: EnvVar[];
    onUpdate: (name: string, value: string, isSecret: boolean) => Promise<EnvVar[]>;
    onDelete: (name: string) => Promise<EnvVar[]>;
    onBulkUpdate: (vars: EnvVar[]) => Promise<EnvVar[]>;
};

export default function TFVarTable({ envVars, onUpdate, onDelete, onBulkUpdate }: TFVarTableProps) {
    const [editingVar, setEditingVar] = useState<EnvVar | null>(null);
    const [newVar, setNewVar] = useState<Omit<EnvVar, 'updated_at'>>({ name: '', value: '', is_secret: false });
    const [bulkEditMode, setBulkEditMode] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleEdit = (envVar: EnvVar) => {
        if (!envVar.is_secret) {
            setEditingVar(envVar);
        }
    };

    const handleSave = async () => {
        if (editingVar) {
            setIsLoading(true);
            await onUpdate(editingVar.name, editingVar.value, editingVar.is_secret);
            setIsLoading(false);
            setEditingVar(null);
            router.refresh();
        }
    };

    const handleAddNew = async () => {
        if (newVar.name && newVar.value) {
            setIsLoading(true);
            await onUpdate(newVar.name, newVar.value, newVar.is_secret);
            setIsLoading(false);
            setNewVar({ name: '', value: '', is_secret: false });
            router.refresh();
        }
    };

    const handleDeleteVar = async (name: string) => {
        setIsLoading(true);
        await onDelete(name);
        setIsLoading(false);
        router.refresh();
    };

    const handleBulkEdit = async () => {
        try {
            const parsedVars = JSON.parse(bulkEditValue);
            if (Array.isArray(parsedVars)) {
                setIsLoading(true);
                await onBulkUpdate(parsedVars.filter(v => !v.is_secret));
                setIsLoading(false);
                setBulkEditMode(false);
                router.refresh();
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };

    const toggleBulkEdit = () => {
        if (!bulkEditMode) {
            setBulkEditValue(JSON.stringify(envVars.filter(v => !v.is_secret), null, 2));
        }
        setBulkEditMode(!bulkEditMode);
    };

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
    };

    if (bulkEditMode) {
        return (
            <div className="space-y-4">
                <Textarea
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    rows={10}
                    className="font-mono"
                />
                <div className="space-x-2">
                    <Button onClick={handleBulkEdit} disabled={isLoading}>
                        {isLoading ? 'Applying...' : 'Apply Bulk Edit'}
                    </Button>
                    <Button variant="outline" onClick={toggleBulkEdit}>Cancel</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="New variable name"
                    value={newVar.name}
                    onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
                />
                <Input
                    placeholder="New variable value"
                    type={newVar.is_secret ? "password" : "text"}
                    value={newVar.value}
                    onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                />
                <Switch
                    checked={newVar.is_secret}
                    onCheckedChange={(checked) => setNewVar({ ...newVar, is_secret: checked })}
                />
                <Button onClick={handleAddNew} disabled={isLoading || !newVar.name || !newVar.value}>
                    {isLoading ? 'Adding...' : 'Add'}
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Secret</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {envVars.map((envVar) => (
                        <TableRow key={envVar.name}>
                            <TableCell>{envVar.name}</TableCell>
                            <TableCell>
                                {editingVar && editingVar.name === envVar.name ? (
                                    <Input
                                        value={editingVar.value}
                                        onChange={(e) => setEditingVar({ ...editingVar, value: e.target.value })}
                                    />
                                ) : (
                                    <span>{envVar.is_secret ? '********' : envVar.value}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Switch
                                    checked={envVar.is_secret}
                                    onCheckedChange={async (checked) => {
                                        await onUpdate(envVar.name, envVar.value, checked);
                                        router.refresh();
                                    }}
                                    disabled={isLoading}
                                />
                            </TableCell>
                            <TableCell>{moment(envVar.updated_at).fromNow()}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(envVar.value)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                {!envVar.is_secret && (
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(envVar)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteVar(envVar.name)} disabled={isLoading}>
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-end">
                <Button onClick={toggleBulkEdit}>Bulk Edit</Button>
            </div>
        </div>
    );
}