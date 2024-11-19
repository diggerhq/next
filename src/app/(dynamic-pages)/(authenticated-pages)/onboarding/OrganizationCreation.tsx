import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createOrganization } from "@/data/user/organizations";
import { generateOrganizationSlug } from "@/lib/utils";
import { CreateOrganizationSchema, createOrganizationSchema } from "@/utils/zod-schemas/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Cookies from 'js-cookie';
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type OrganizationCreationProps = {
  onSuccess: () => void;
};

export function OrganizationCreation({ onSuccess }: OrganizationCreationProps) {
  const { toast } = useToast();
  const { register, handleSubmit, setValue, formState: { errors, isValid } } = useForm<CreateOrganizationSchema>({
    resolver: zodResolver(createOrganizationSchema),
  });

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SKIP_ORG_CREATION === "true") {
      createOrgMutation.mutate({ "organizationTitle": "digger", organizationSlug: "digger" });
    }
  }, [onSuccess])

  const createOrgMutation = useMutation({
    mutationFn: async ({ organizationTitle, organizationSlug }: CreateOrganizationSchema) => {
      if (process.env.NEXT_PUBLIC_SKIP_ORG_CREATION === "true") {
        return createOrganization(organizationTitle, organizationSlug, { isOnboardingFlow: true, ignoreIfOrgExists: true })
      } else {
        return createOrganization(organizationTitle, organizationSlug, { isOnboardingFlow: true })
      }
    },
    onSuccess: (data) => {
      const { data: orgId } = data as { data: string }
      console.log('created organization ID:', orgId);
      Cookies.set('organization', orgId);
      toast({ title: "Organization created!", description: "Your new organization is ready." });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: "Failed to create organization", description: "Please try again.", variant: "destructive" });
    },
  });

  const onSubmit = (data: CreateOrganizationSchema) => {
    createOrgMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardHeader>
        <CardTitle>Create Your Organization</CardTitle>
        <CardDescription>Set up your first organization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organizationTitle">Organization Name</Label>
          <Input
            id="organizationTitle"
            {...register("organizationTitle")}
            placeholder="Enter organization name"
            onChange={(e) => {
              setValue("organizationSlug", generateOrganizationSlug(e.target.value), { shouldValidate: true });
              setValue("organizationTitle", e.target.value, { shouldValidate: true });
            }}
          />
          {errors.organizationTitle && (
            <p className="text-sm text-destructive">{errors.organizationTitle.message}</p>
          )}
        </div>
        {/* <div className="space-y-2">
          <Label htmlFor="organizationSlug">Organization Slug</Label>
          <Input
            id="organizationSlug"
            {...register("organizationSlug")}
            placeholder="organization-slug"
          />
          {errors.organizationSlug && (
            <p className="text-sm text-destructive">{errors.organizationSlug.message}</p>
          )}
        </div> */}
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={createOrgMutation.isLoading || !isValid}
        >
          {createOrgMutation.isLoading ? "Creating..." : "Create Organization"}
        </Button>
      </CardFooter>
    </form>
  );
}
