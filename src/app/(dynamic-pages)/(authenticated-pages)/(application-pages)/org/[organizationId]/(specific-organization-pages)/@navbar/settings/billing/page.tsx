import { cn } from '@/utils/cn';
import { organizationParamSchema } from '@/utils/zod-schemas/params';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export default async function OrganizationSettingsNavbar({
  params,
}: {
  params: unknown;
}) {
  const { organizationId } = organizationParamSchema.parse(params);
  return (
    <div className={cn('hidden ', 'relative flex gap-2 items-center')}>
      Billing
      <Link
        className="flex gap-1.5 py-1.5 px-3 cursor-pointer items-center group rounded-md transition hover:cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
        href={`/org/${organizationId}`}
      >
        <ArrowLeftIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300" />
        <span className="text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 text-sm font-normal">
          Back to Organization
        </span>
      </Link>
    </div>
  );
}
