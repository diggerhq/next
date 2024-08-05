'use client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { deleteTeamFromOrganization } from '@/data/admin/teams';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { TrashIcon } from 'lucide-react';
import UsersIcon from 'lucide-react/dist/esm/icons/users';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type DeleteTeamDialogProps = {
    organizationId: string;
    teamId: number;
    teamName: string;
    isOrganizationAdmin: boolean;
};

export function DeleteTeamDialog({ organizationId, teamId, teamName, isOrganizationAdmin }: DeleteTeamDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { mutate, isLoading } = useSAToastMutation(
        async () => await deleteTeamFromOrganization(teamId, organizationId),
        {
            loadingMessage: 'Deleting team...',
            successMessage: 'Team deleted successfully!',
            errorMessage: 'Failed to delete team',
            onSuccess: () => {
                setOpen(false);
                router.refresh();
            },
        },
    );

    const handleDelete = () => {
        if (!isOrganizationAdmin) return;
        mutate();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={!isOrganizationAdmin || isLoading}>
                        <TrashIcon className="size-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <div className="p-3 w-fit bg-gray-200/50 dark:bg-gray-700/40 mb-2 rounded-lg">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        <div className="p-1">
                            <DialogTitle className="text-lg">Delete Team</DialogTitle>
                            <DialogDescription className="text-base mt-0">
                                Are you sure you want to delete the team "{teamName}"? This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading}
                            className="w-full"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full"
                            disabled={isLoading}
                            onClick={handleDelete}
                        >
                            {isLoading ? 'Deleting Team...' : 'Delete Team'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}