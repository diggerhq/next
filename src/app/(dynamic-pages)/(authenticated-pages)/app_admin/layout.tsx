import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { AppSupabaseClient } from '@/types';
import { errors } from '@/utils/errors';
import { getIsAppAdmin, getUserProfile } from '@/utils/supabase-queries';
import { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { AppAdminNavigation } from './AppAdminNavigation';
import { InternalNavbar } from '@/components/ui/NavigationMenu/InternalNavbar';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { Badge } from '@/components/ui/Badge';

async function fetchData(supabaseClient: AppSupabaseClient, authUser: User) {
  const [isUserAppAdmin] = await Promise.all([
    getIsAppAdmin(supabaseClient, authUser),
  ]);

  return { isUserAppAdmin };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const user = await serverGetLoggedInUser();

  try {
    const { isUserAppAdmin } = await fetchData(supabaseClient, user);

    if (!isUserAppAdmin) {
      return redirect('/dashboard');
    }
    return (
      <div className="flex-1 pb-10 relative h-auto max-h-screen w-full overflow-auto">
        <InternalNavbar
          title="Organization Name"
          badge={
            <Badge variant="discussion" size="xxs" className="ml-2">
              Beta
            </Badge>
          }
        />
        <div className="px-12 space-y-6">
          <AppAdminNavigation />
          {children}
        </div>
      </div>
    );
  } catch (fetchDataError) {
    errors.add(fetchDataError);
    return <p>Error: An error occurred.</p>;
  }
}
