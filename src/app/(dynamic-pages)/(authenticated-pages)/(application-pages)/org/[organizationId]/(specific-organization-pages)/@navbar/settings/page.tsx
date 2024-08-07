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
    <div className={cn('hidden ', 'relative flex gap-2 items-center ')}>
      <Link
        className="flex gap-1.5 py-1 cursor-pointer items-center group rounded-md transition hover:cursor-pointer"
        href={`/org/${organizationId}`}
      >
        <ArrowLeftIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
        <p className="text-muted-foreground group-hover:text-foreground text-sm font-normal">
          Back to Organization
        </p>
      </Link>

    </div>
  );
}
