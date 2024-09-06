'use client'

import { Button } from "@/components/Button";
import { triggerApplyAction } from "@/data/user/projects";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";

export function TriggerApplyButton({ projectId }: { projectId: string }) {

    const updateProjectSettingsMutation = useSAToastMutation(
        async () => {
            const result = await triggerApplyAction({
                projectId: projectId,
            });
            return result;
        },
        {
            loadingMessage: "Triggering apply...",
            successMessage: "Apply run scheduled successfully!",
            errorMessage: "Failed to schedule Apply run",
        }
    );

    const onClick = async () => {
        try {
            await updateProjectSettingsMutation.mutateAsync();
        } catch (error) {
            console.error("Error updating project settings:", error);
        }
    };

    return (
        <Button variant="default" onClick={onClick} size="sm">
            Trigger Apply
        </Button>
    )
}