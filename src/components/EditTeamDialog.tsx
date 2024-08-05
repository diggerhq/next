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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { editTeamAction } from '@/data/user/teams';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { PencilIcon } from 'lucide-react';
import UsersIcon from 'lucide-react/dist/esm/icons/users';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type EditTeamDialogProps = {
    organizationId: string;
    teamId: number;
    initialTeamName: string;
    isOrganizationAdmin: boolean;
};

export function EditTeamDialog({ organizationId, teamId, initialTeamName, isOrganizationAdmin }: EditTeamDialogProps) {
    const [teamTitle, setTeamTitle] = useState<string>(initialTeamName);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { mutate, isLoading } = useSAToastMutation(
        async () => await editTeamAction(teamId, organizationId, teamTitle),
        {
            loadingMessage: 'Updating team...',
            successMessage: 'Team updated!',
            errorMessage: 'Failed to update team.',
            onSuccess: (data) => {
                if (data.status === 'success') {
                    setOpen(false);
                    router.refresh();
                }
            },
        },
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isOrganizationAdmin) return;
        mutate();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={!isOrganizationAdmin}>
                        <PencilIcon className='size-4' />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <div className="p-3 w-fit bg-gray-200/50 dark:bg-gray-700/40 mb-2 rounded-lg">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        <div className="p-1">
                            <DialogTitle className="text-lg">Edit Team</DialogTitle>
                            <DialogDescription className="text-base mt-0">
                                Update your team's information.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-8">
                            <Label className="text-muted-foreground">Team Name</Label>
                            <Input
                                value={teamTitle}
                                onChange={(event) => {
                                    setTeamTitle(event.target.value);
                                }}
                                required
                                className="mt-1.5 shadow appearance-none border h-11 rounded-lg w-full py-2 px-3 focus:ring-0 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline text-base"
                                id="name"
                                type="text"
                                placeholder="Team Name"
                                disabled={isLoading}
                            />
                        </div>

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
                                type="submit"
                                variant="default"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Updating Team...' : 'Update Team'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}