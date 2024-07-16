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
    <div className={cn('hidden', 'relative flex gap-2 items-center')}>
      <Link
        className="flex gap-1.5 py-1.5 px-3 cursor-pointer items-center group rounded-md transition hover:cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900"
        href={`/org/${organizationId}`}
      >
        <ArrowLeftIcon className="w-4 h-4 text-primary-500 dark:text-primary-500 group-hover:text-primary-700 dark:group-hover:text-primary-700" />
        <span className="text-primary-500 dark:text-primary-500 group-hover:text-primary-700 dark:group-hover:text-primary-700 text-sm font-normal">
          Back to Organization
        </span>
      </Link>
    </div>
  );
}
