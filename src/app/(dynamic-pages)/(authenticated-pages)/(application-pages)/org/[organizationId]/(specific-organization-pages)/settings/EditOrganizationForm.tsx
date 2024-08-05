"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateOrganizationInfo } from "@/data/user/organizations";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import { generateSlug } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  organizationTitle: z.string().min(2).max(50),
  organizationSlug: z.string().min(2).max(50),
});

export function EditOrganizationForm({
  initialTitle,
  organizationId,
  initialSlug,
}: {
  initialTitle: string;
  organizationId: string;
  initialSlug: string;
}) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationTitle: initialTitle,
      organizationSlug: initialSlug,
    },
  });

  const { mutate, isLoading } = useSAToastMutation(
    async (values: z.infer<typeof formSchema>) => {
      return await updateOrganizationInfo(
        organizationId,
        values.organizationTitle,
        values.organizationSlug,
      );
    },
    {
      loadingMessage: "Updating organization information...",
      successMessage: "Organization information updated!",
      errorMessage: "Failed to update organization information",
      onSuccess(response) {
        if (response.status === "success" && response.data) {
          router.push(`/org/${response.data.id}/settings`);
        }
      },
    },
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Edit Organization</CardTitle>
          <CardDescription>Update your organization's title and slug</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
              <FormField
                control={form.control}
                name="organizationTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue("organizationSlug", generateSlug(e.target.value), { shouldValidate: true });
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the title that will be displayed on the organization page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Organization"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </motion.div>
  );
}