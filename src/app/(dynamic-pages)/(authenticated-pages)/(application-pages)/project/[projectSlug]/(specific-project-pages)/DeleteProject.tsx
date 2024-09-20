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
import { deleteProject } from '@/data/user/projects';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type DeleteProjectProps = {
    projectName: string;
    projectId: string;
};

export const DeleteProject = ({
    projectName,
    projectId,
}: DeleteProjectProps) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const formSchema = z.object({
        projectName: z
            .string()
            .refine(
                (v) => v === `delete ${projectName}`,
                `Must match "delete ${projectName}"`,
            ),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: '',
        },
    });

    const { mutate, isLoading } = useSAToastMutation(
        async () => deleteProject(projectId),
        {
            onSuccess: () => {
                toast.success('Project deleted');
                setOpen(false);
                router.push('/dashboard');
            },
            loadingMessage: 'Deleting project...',
            errorMessage(error) {
                try {
                    if (error instanceof Error) {
                        return String(error.message);
                    }
                    return `Failed to delete project ${String(error)}`;
                } catch (_err) {
                    console.warn(_err);
                    return 'Failed to delete project';
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
            className="mt-4"
        >
            <Card className="w-full  max-w-5xl border-destructive/50 bg-destructive/5">
                <CardHeader>
                    <CardTitle>
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Deleting a project does not destroy associated resources! Make sure to destroy them.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-start">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">Delete Project</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Project</DialogTitle>
                                <DialogDescription>
                                    Type <strong>"delete {projectName}"</strong> to confirm.
                                </DialogDescription>
                            </DialogHeader>
                            <FormProvider {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="projectName"
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
                                            {isLoading ? 'Deleting...' : 'Delete'} Project
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