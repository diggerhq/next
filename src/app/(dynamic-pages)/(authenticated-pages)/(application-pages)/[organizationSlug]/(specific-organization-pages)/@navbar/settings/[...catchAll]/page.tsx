import { T } from '@/components/ui/Typography';
import { cn } from '@/utils/cn';
import { organizationSlugParamSchema } from '@/utils/zod-schemas/params';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export default async function OrganizationSettingsNavbar({
  params,
}: {
  params: unknown;
}) {
  const { organizationSlug } = organizationSlugParamSchema.parse(params);

  return (
    <div className={cn('hidden lg:block', 'relative ')}>
      <T.P className="my-0">
        <Link href={`/${organizationSlug}`}>
          <span className="space-x-2 flex items-center">
            <ArrowLeftIcon />
            <span>Back to Organization catch all</span>
          </span>
        </Link>
      </T.P>
    </div>
  );
}
