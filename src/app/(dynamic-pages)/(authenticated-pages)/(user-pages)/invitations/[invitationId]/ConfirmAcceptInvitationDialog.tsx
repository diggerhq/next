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
import { acceptInvitationAction } from '@/data/user/invitation';
import { useToastMutation } from '@/hooks/useToastMutation';
import Check from 'lucide-react/dist/esm/icons/check';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const ConfirmAcceptInvitationDialog = ({
  invitationId,
}: {
  invitationId: string;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate, isLoading } = useToastMutation(acceptInvitationAction, {
    loadingMessage: 'Accepting invitation...',
    successMessage: 'Invitation accepted!',
    errorMessage: 'Failed to accept invitation.',
    onSuccess: (organizationId) => {
      router.push(`/organization/${organizationId}`);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          data-testid="dialog-accept-invitation-trigger"
          variant="default"
          size="default"
        >
          <Check className="mr-2 h-5 w-5" /> Accept Invitation
        </Button>
      </DialogTrigger>
      <DialogContent
        data-testid="dialog-accept-invitation-content"
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <div className="p-3 w-fit bg-gray-200/50 dark:bg-gray-700/40 rounded-lg">
            <Check className="w-6 h-6" />
          </div>
          <div className="p-1">
            <DialogTitle className="text-lg">Accept Invitation</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to accept this invitation?
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            disabled={isLoading}
            variant="outline"
            className="w-full"
            data-testid="cancel"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-testid="confirm"
            disabled={isLoading}
            variant="default"
            className="w-full"
            onClick={() => {
              mutate(invitationId);
              setOpen(false);
            }}
          >
            {isLoading ? 'Accepting...' : 'Accept'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
