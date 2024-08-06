'use client'

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { bulkUpdateTFVars } from "@/data/admin/env-vars";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { useState } from "react";

export function BulkEditTFVars({ projectId, organizationId, initialBulkEditValue, setIsBulkEditing }: {
    projectId: string;
    organizationId: string;
    initialBulkEditValue: string;
    setIsBulkEditing: (value: boolean) => void;
}) {
    const [bulkEditValue, setBulkEditValue] = useState(initialBulkEditValue);


    const { mutate: bulkEditTFVars, isLoading: isBulkEditingTFVars } = useSAToastMutation(
        async (data: string) => bulkUpdateTFVars(data, projectId, organizationId), {
        loadingMessage: "Applying bulk edit...",
        successMessage: "Bulk edit applied!",
        errorMessage: "Failed to apply bulk edit",
        onSuccess: (response) => {
            setBulkEditValue(JSON.stringify(response, null, 2));
            setIsBulkEditing(false);
        },
    }
    )

    return (
        <div className="space-y-4" >
            <Textarea
                value={bulkEditValue}
                onChange={(e) => setBulkEditValue(e.target.value)}
                rows={24}
                className="font-mono"
            />
            <div className="flex gap-2 w-full justify-between">
                <Button variant="outline" onClick={() => setIsBulkEditing(false)}>Cancel</Button>
                <Button onClick={() => bulkEditTFVars(bulkEditValue)} disabled={isBulkEditingTFVars}>
                    {isBulkEditingTFVars ? 'Applying...' : 'Apply Bulk Edit'}
                </Button>
            </div>
        </div >
    )
}


