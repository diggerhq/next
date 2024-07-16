'use client';
import { T } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { deleteOrganization } from '@/data/user/organizations';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type DeleteOrganizationProps = {
  organizationTitle: string;
  organizationId: string;
};

export const DeleteOrganization = ({
  organizationTitle,
  organizationId,
}: DeleteOrganizationProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate, isLoading } = useSAToastMutation(
    async () => deleteOrganization(organizationId),
    {
      onSuccess: () => {
        toast.success('Organization deleted');
        setOpen(false);
        router.push('/dashboard');
      },
      loadingMessage: 'Deleting organization...',
      errorMessage(error) {
        try {
          if (error instanceof Error) {
            return String(error.message);
          }
          return `Failed to delete organization ${String(error)}`;
        } catch (_err) {
          console.warn(_err);
          return 'Failed to delete organization';
        }
      },
    },
  );

  type inputs = {
    organizationTitle: string;
  };

  const formSchema = z.object({
    organizationTitle: z
      .string()
      .refine(
        (v) => v === `delete ${organizationTitle}`,
        `Must match "delete ${organizationTitle}"`,
      ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<inputs>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = () => {
    mutate();
    toast.success('Organization deleted');
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <T.H3>Danger Zone</T.H3>
      <div>
        <T.P>Delete your organization</T.P>
        <T.Subtle>
          Once you delete an organization, there is no going back. Please be
          certain.
        </T.Subtle>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={'destructive'}>Delete Organization</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Type <strong> "delete {organizationTitle}" </strong>to confirm.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input type="text" {...register('organizationTitle')} />
            {errors.organizationTitle && (
              <p className="text-red-400 text-sm font-bold">
                {errors.organizationTitle.message}
              </p>
            )}

            <Button
              disabled={isLoading || !isValid}
              type="submit"
              variant="destructive"
              className="w-fit self-end"
            >
              {isLoading ? 'Deleting...' : 'Delete'} Organization
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
