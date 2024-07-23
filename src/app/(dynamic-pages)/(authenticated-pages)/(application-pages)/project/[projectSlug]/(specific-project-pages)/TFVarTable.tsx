import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Edit, Eye, EyeOff, Plus, Trash } from 'lucide-react';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import EmptyState from "./EmptyTFVarState";

type TFVar = {
    name: string;
    value: string;
    updated_at: string;
}

type TFVarTableProps = {
    initialVariables: string;
    onUpdate: (variables: string) => Promise<void>;
}

const TFVarTable: React.FC<TFVarTableProps> = ({ initialVariables, onUpdate }) => {
    const [tfvars, setTfvars] = useState<TFVar[]>(() => {
        try {
            return JSON.parse(initialVariables);
        } catch (error) {
            console.error("Failed to parse initial variables:", error);
            return [];
        }
    });
    const [editingState, setEditingState] = useState<{
        index: number | null;
        var: TFVar | null;
    }>({
        index: null,
        var: null,
    });
    const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
    const [bulkEditMode, setBulkEditMode] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState(initialVariables);

    const { mutate: updateTFVar } = useSAToastMutation<string, Error, TFVar[]>(
        async (updatedVars) => {
            const jsonString = JSON.stringify(updatedVars);
            await onUpdate(jsonString);
            return { status: 'success', data: jsonString };
        },
        {
            loadingMessage: 'Updating TF variables...',
            successMessage: 'Variables updated successfully',
            errorMessage: 'Failed to update TF variables',
            onSuccess: (response) => {
                const updatedVars = JSON.parse(response.data) as TFVar[];
                setTfvars(updatedVars);
            },
        }
    );

    const handleEdit = (index: number) => {
        setEditingState({
            index,
            var: { ...tfvars[index] },
        });
    };

    const handleSave = () => {
        if (editingState.index === null || editingState.var === null) return;

        const updatedVar = {
            ...editingState.var,
            updated_at: new Date().toISOString(),
        };

        const isDuplicate = tfvars.some((v, i) =>
            i !== editingState.index && v.name === updatedVar.name
        );

        if (isDuplicate) {
            toast.error('Variable with this name already exists');
            return;
        }

        const newTFVars = [...tfvars];
        newTFVars[editingState.index] = updatedVar;
        updateTFVar(newTFVars);
        setEditingState({ index: null, var: null });
    };

    const handleDelete = (index: number) => {
        const updatedTFVars = tfvars.filter((_, i) => i !== index);
        updateTFVar(updatedTFVars);
        toast.success(`Variable ${tfvars[index].name} deleted`);
    };

    const handleAddVariable = () => {
        const now = new Date().toISOString();
        const newVar: TFVar = {
            name: `NEW_VARIABLE_${tfvars.length + 1}`,
            value: 'ENV_VALUE',
            updated_at: now,
        };
        const newIndex = tfvars.length;
        setTfvars([...tfvars, newVar]);
        setEditingState({
            index: newIndex,
            var: newVar,
        });
    };
    const handleBulkEdit = () => {
        try {
            const parsedVars = JSON.parse(bulkEditValue);
            const validatedVars = parsedVars.map(({ name, value }) => {
                if (!name || typeof value === 'undefined') {
                    throw new Error(`Invalid variable: ${JSON.stringify({ name, value })}`);
                }
                const existingVar = tfvars.find(v => v.name === name);
                return {
                    name,
                    value,
                    updated_at: existingVar ? existingVar.updated_at : new Date().toISOString()
                };
            });

            const names = new Set();
            validatedVars.forEach(v => {
                if (names.has(v.name)) {
                    throw new Error(`Duplicate variable name: ${v.name}`);
                }
                names.add(v.name);
            });

            updateTFVar(validatedVars);
            setBulkEditMode(false);
            toast.success('Bulk edit successful');
        } catch (error) {
            toast.error(`Invalid JSON format: ${error.message}`);
        }
    };

    const toggleBulkEdit = () => {
        if (!bulkEditMode) {
            const filteredVars = tfvars.map(({ name, value }) => ({ name, value }));
            setBulkEditValue(JSON.stringify(filteredVars, null, 2));
        }
        setBulkEditMode(!bulkEditMode);
    };

    const copyToClipboard = useCallback((tfvar: TFVar) => {
        navigator.clipboard.writeText(JSON.stringify(tfvar, null, 2));
        toast.success('Copied to clipboard');
    }, []);

    const handleInputChange = (field: 'name' | 'value', value: string) => {
        if (editingState.var) {
            setEditingState(prev => ({
                ...prev,
                var: {
                    ...prev.var!,
                    [field]: field === 'name' ? value.toUpperCase() : value
                }
            }));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {!bulkEditMode ? (
                <>
                    <Table>
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
                        {tfvars.length > 0 ? (
                            <TableBody>
                                <AnimatePresence>
                                    {tfvars.map((tfvar, index) => (
                                        <motion.tr
                                            key={tfvar.name}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <TableCell>
                                                {editingState.index === index ? (
                                                    <Input
                                                        value={editingState.var?.name}
                                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                                        onBlur={(e) => handleInputChange('name', e.target.value.toUpperCase())}
                                                    />
                                                ) : tfvar.name}
                                            </TableCell>
                                            <TableCell>
                                                {editingState.index === index ? (
                                                    <Input
                                                        value={editingState.var?.value}
                                                        onChange={(e) => handleInputChange('value', e.target.value)}
                                                    />
                                                ) : (
                                                    <span
                                                        className={showSecrets[tfvar.name] ? '' : 'filter blur-sm select-none'}
                                                        style={{ userSelect: showSecrets[tfvar.name] ? 'auto' : 'none' }}
                                                    >
                                                        {tfvar.value}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setShowSecrets((prev) => ({ ...prev, [tfvar.name]: !prev[tfvar.name] }))}
                                                >
                                                    {showSecrets[tfvar.name] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </Button>
                                            </TableCell>
                                            <TableCell>{moment(tfvar.updated_at).fromNow()}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(tfvar)}
                                                >
                                                    <Copy size={16} />
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                {editingState.index === index ? (
                                                    <Button onClick={handleSave}>Save</Button>
                                                ) : (
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                                                        <Edit size={16} />
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                                                    <Trash size={16} className="text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        ) : (<TableBody>
                            <TableRow className=" hover:bg-transparent">
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <EmptyState onAddVariable={handleAddVariable} />
                                </TableCell>
                            </TableRow>
                        </TableBody>)}
                    </Table>
                    {tfvars.length > 0 && (
                        <div className="mt-4 flex justify-end">
                            <Button variant="ghost" onClick={handleAddVariable}>
                                <Plus className="mr-2 h-4 w-4" /> Add Environment Variable
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="mt-4">
                    <textarea
                        className="w-full h-[400px] p-2 border rounded font-mono text-sm"
                        value={bulkEditValue}
                        onChange={(e) => setBulkEditValue(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setBulkEditMode(false)}>Cancel</Button>
                        <Button onClick={handleBulkEdit}>Apply Bulk Edit</Button>
                    </div>
                </div>
            )}

            {tfvars.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold">Bulk Edit Environment Variables</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        Edit all environment variables at once in JSON format. Be careful with this operation.
                    </p>
                    <Button variant="secondary" className="w-full" onClick={toggleBulkEdit}>
                        {bulkEditMode ? 'Cancel Bulk Edit' : 'Bulk Edit'}
                    </Button>
                </div>
            )}
        </motion.div>
    );
};

export default TFVarTable;