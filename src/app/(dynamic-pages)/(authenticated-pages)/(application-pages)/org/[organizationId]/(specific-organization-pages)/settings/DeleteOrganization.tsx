'use client';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { deleteOrganization } from '@/data/user/organizations';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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

  const formSchema = z.object({
    organizationTitle: z
      .string()
      .refine(
        (v) => v === `delete ${organizationTitle}`,
        `Must match "delete ${organizationTitle}"`,
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationTitle: '',
    },
  });

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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full  max-w-4xl border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle>
            Danger Zone
          </CardTitle>
          <CardDescription>
            Once you delete an organization, there is no going back. This action will permanently remove all associated data and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-start">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Organization</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Organization</DialogTitle>
                <DialogDescription>
                  Type <strong>"delete {organizationTitle}"</strong> to confirm.
                </DialogDescription>
              </DialogHeader>
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="organizationTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmation</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isLoading || !form.formState.isValid}
                    >
                      {isLoading ? 'Deleting...' : 'Delete'} Organization
                    </Button>
                  </DialogFooter>
                </form>
              </FormProvider>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
};