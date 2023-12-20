'use client';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { revokeInvitation } from '@/data/user/invitation';
import { useToastMutation } from '@/hooks/useToastMutation';
import { useState } from 'react';

type Props = {
  invitationId: string;
};

export const RevokeInvitationDialog = ({ invitationId }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate, isLoading } = useToastMutation(revokeInvitation, {
    onSettled: () => {
      setOpen(false);
    },
    loadingMessage: 'Revoking Invitation...',
    successMessage: 'Invitation revoked!',
    errorMessage: 'Unable to revoke Invitation.',
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
          Revoke
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>.dialog-close]:hidden">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutate(invitationId);
          }}
        >
          <DialogHeader>
            <DialogTitle>Revoke Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this invitation? This action is
              irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <input type="hidden" name="invitationId" value={invitationId} />
            <Button
              variant="destructive"
              type="submit"
              aria-disabled={isLoading}
            >
              {isLoading ? 'Revoking Invitation...' : 'Yes, revoke'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
