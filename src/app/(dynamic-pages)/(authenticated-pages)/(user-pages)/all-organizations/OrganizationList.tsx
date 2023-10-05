'use client';
import { Anchor } from '@/components/Anchor';
import { PageHeading } from '@/components/presentational/tailwind/PageHeading/PageHeading';
import moment from 'moment';
import {
  InitialOrganizationListType,
  useCreateOrganizationMutation,
  useOrganizationsList,
} from '@/utils/react-query-hooks';
import { CreateOrganizationDialog } from '@/components/presentational/tailwind/CreateOrganizationDialog';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table/ShadcnTable';

// convert the above organizationgraphs import to next dynamic
import dynamic from 'next/dynamic';
import { useMutation } from '@tanstack/react-query';
import { Table } from '@/types';
import { useRef, useState } from 'react';
import { useLoggedInUser } from '@/hooks/useLoggedInUser';
const OrganizationGraphs = dynamic(
  () => import('./OrganizationGraphs').then((mod) => mod.OrganizationGraphs),
  {
    ssr: false,
  },
);

export function OrganizationList({
  organizationList,
  createOrganization,
}: {
  organizationList: InitialOrganizationListType;
  createOrganization: (organizationTitle: string) => Promise<void>;
}) {
  const toastRef = useRef<string>();
  const user = useLoggedInUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const router = useRouter();
  const { mutate, isLoading: isCreatingOrganization } = useMutation(
    async (organizationTitle: string) => {
      return createOrganization(organizationTitle);
    },
    {
      onMutate: async (name) => {
        toastRef.current = toast.loading(`Creating organization ${name}...`);
      },
      onSuccess: () => {
        // Invalidate the organization list query
        toast.success(`Organization  created!`, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        // router.push(`/organization/${organization.id}`);
      },
      onError: (error) => {
        const customError =
          error instanceof Error ? error : new Error(String(error));
        toast.error(`Error creating organization: ${customError.message}`, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    },
  );
  const onConfirm = (organizationTitle: string) => {
    mutate(organizationTitle);
  };
  return (
    <div className="space-y-10 mb-10">
      <div className="space-y-2">
        <PageHeading
          actions={
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <CreateOrganizationDialog
                isLoading={isCreatingOrganization}
                onConfirm={onConfirm}
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
              />
            </div>
          }
          title="Organizations"
          subTitle="Organizations are the central unit of work. Each has a team and a
          unique Stripe plan. Customize the database models and add spaces with
          members to an organization."
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <ShadcnTable>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizationList.map((organization, index) => {
              // console.log(organization);
              const teamMembers = Array.isArray(
                organization.organization_members,
              )
                ? organization.organization_members
                : [];
              const teamMembersCount = teamMembers.length;
              const owner = teamMembers.find(
                (member) => member.member_role === 'owner',
              );
              const ownerUserProfile = Array.isArray(owner?.user_profiles)
                ? owner?.user_profiles[0]
                : owner?.user_profiles;

              if (!ownerUserProfile) {
                // THIS IS A HACK
                // User profile will always be there
                throw new Error('Owner user profile not found');
              }

              return (
                <TableRow key={organization.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Anchor
                      className=" font-medium underline underline-offset-4 "
                      key={organization.id}
                      href={`/organization/${organization.id}`}
                    >
                      {organization.title}
                    </Anchor>
                  </TableCell>
                  <TableCell>{teamMembersCount} members</TableCell>
                  <TableCell>
                    {moment(organization.created_at).fromNow()}
                  </TableCell>
                  <TableCell>{ownerUserProfile.full_name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </ShadcnTable>
      </div>
      <OrganizationGraphs />
    </div>
  );
}