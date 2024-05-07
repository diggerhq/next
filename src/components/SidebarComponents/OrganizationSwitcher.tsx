'use client';
import { CreateOrganizationDialog } from '@/components/CreateOrganizationDialog';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { createOrganization } from '@/data/user/organizations';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { cn } from '@/utils/cn';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, UsersRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function OrganizationSwitcher({
  slimOrganizations,
  currentOrganizationId,
}: {
  slimOrganizations: Array<{
    id: string;
    title: string;
  }>;
  currentOrganizationId: string;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const currentOrganization = slimOrganizations.find(
    (organization) => organization.id === currentOrganizationId,
  );
  const { mutate, isLoading } = useSAToastMutation(
    async (organizationTitle: string) => {
      return await createOrganization(organizationTitle);
    },
    {
      loadingMessage: 'Creating organization...',
      errorMessage(error) {
        try {
          if (error instanceof Error) {
            return String(error.message);
          }
          return `Failed to create organization ${String(error)}`;
        } catch (_err) {
          console.warn(_err);
          return 'Failed to create organization';
        }
      },
      successMessage: 'Organization created!',
      onSuccess: (organization) => {
        router.push(`/organization/${organization}`);
      },
    },
  );

  const onConfirm = (organizationTitle: string) => {
    mutate(organizationTitle);
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={(isCurrentOpen) => {
        setIsPopoverOpen(isCurrentOpen);
        if (!isCurrentOpen) {
          setIsDialogOpen(false);
        }
      }}
    >
      <PopoverTrigger asChild className="w-fit">
        <Button
          variant="ghost"
          size="sm"
          data-testid="organization-switcher"
          role="combobox"
          className="mx-0 px-2 py-5 border hover:border-neutral-700 dark:hover:border-gray-500 hover:bg-transparent rounded-sm font-normal text-gray-500 dark:text-gray-300 text-sm justify-between truncate w-full "
        >
          <div className="flex items-center gap-1">
            <UsersRound className="mr-2 h-4 w-4 mt-0.5" />
            {currentOrganization?.title ?? 'Select Organization'}
          </div>
          <ChevronsUpDown className=" h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-[238px] border -ml-1 my-2 rounded-lg p-0 "
      >
        <Command>
          <CommandList>
            <CommandEmpty>No Organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {slimOrganizations.map((organization) => (
                <CommandItem
                  key={organization.id}
                  onSelect={() => {
                    setIsPopoverOpen(false);
                    router.push(`/organization/${organization.id}`);
                  }}
                  className="text-sm flex items-start"
                >
                  {/* <UsersIcon className="mr-2 h-4 w-4 mt-0.5" /> */}
                  {organization.title}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      organization.id === currentOrganizationId
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem className="px-1 py-0 w-full">
                <CreateOrganizationDialog
                  isLoading={isLoading}
                  onConfirm={onConfirm}
                  variant="ghost"
                  className="p-0 py-0 focus:ring-0 dark:focus:ring-0 hover:bg-transparent w-full"
                  isDialogOpen={isDialogOpen}
                  setIsDialogOpen={(isCurrentOpen) => {
                    setIsDialogOpen(isCurrentOpen);
                    setIsPopoverOpen(isCurrentOpen);
                  }}
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
