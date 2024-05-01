import { Skeleton } from '@/components/ui/skeleton';
import { SIDEBAR_VISIBILITY_COOKIE_KEY } from '@/constants';
import { LoggedInUserProvider } from '@/contexts/LoggedInUserContext';
import { SidebarVisibilityProvider } from '@/contexts/SidebarVisibilityContext';
import {
  fetchSlimOrganizations,
  getDefaultOrganization,
  setDefaultOrganization,
} from '@/data/user/organizations';
import { getAcceptedTermsOfService, getUserProfile } from '@/data/user/user';
import { errors } from '@/utils/errors';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { cookies } from 'next/headers';
import { Suspense, type ReactNode } from 'react';
import { ClientLayout } from './ClientLayout';

function getSidebarVisibility() {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(SIDEBAR_VISIBILITY_COOKIE_KEY)?.value;
  if (cookieValue) {
    return cookieValue === 'true';
  }
  return true;
}

async function getDefaultOrganizationOrSet(): Promise<string | null> {
  const [slimOrganizations, defaultOrganizationId] = await Promise.all([
    fetchSlimOrganizations(),
    getDefaultOrganization(),
  ]);
  const firstOrganization = slimOrganizations[0];

  if (defaultOrganizationId) {
    return defaultOrganizationId;
  }

  if (!firstOrganization) {
    return null;
  }

  await setDefaultOrganization(firstOrganization.id);

  return firstOrganization.id;
}

const getOnboardingConditions = async (userId: string) => {
  const [userProfile, defaultOrganizationId, acceptedTerms] = await Promise.all([
    getUserProfile(userId),
    getDefaultOrganizationOrSet(),
    getAcceptedTermsOfService(userId),
  ]);

  return {
    userProfile,
    defaultOrganizationId,
    terms: acceptedTerms,
  };
};

async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await serverGetLoggedInUser();
  console.log('---------------')
  console.log('AuthenticatedLayout')
  console.log('---------------');
  try {
    const sidebarVisibility = getSidebarVisibility();
    const onboardingConditions = await getOnboardingConditions(user.id);

    return (
      <SidebarVisibilityProvider initialValue={sidebarVisibility}>
        <LoggedInUserProvider user={user}>
          <ClientLayout onboardingConditions={onboardingConditions}>
            {children}
          </ClientLayout>
        </LoggedInUserProvider>
      </SidebarVisibilityProvider>
    );
  } catch (fetchDataError) {
    errors.add(fetchDataError);
    return <p>Error: An error occurred.</p>;
  }
}
export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="w-16 h-6" />}>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  );
}
