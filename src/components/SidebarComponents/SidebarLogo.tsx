import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import lightLogo from 'public/images/digger-logo.png';
import { T } from '../ui/Typography';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { SidebarClose } from './SidebarClose';
type Props = {
  organizationId?: string;
  slimOrganizations?: { id: string, title: string, slug: string }[];
};

export function SwitcherAndToggle({ organizationId, slimOrganizations }: Props) {
  return (
    <div className="flex items-center w-full gap-4 justify-between">
      {organizationId && slimOrganizations ? (
        <OrganizationSwitcher
          currentOrganizationId={organizationId}
          slimOrganizations={slimOrganizations}
        />
      ) : <Link
        href="/dashboard"
        className="ml-5 cursor-pointer flex items-center gap-3 w-full"
      >
        <Image
          width={24}
          src={lightLogo}
          alt="Digger Logo"
          className={cn(
            'rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0',
            '-ml-2 ',
          )}
        />
        <T.P className="text-base font-medium text-neutral-600 dark:text-slate-300">
          Digger
        </T.P>
      </Link>}
      <SidebarClose />
    </div>
  );
}
