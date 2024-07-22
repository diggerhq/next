import { Skeleton } from "@/components/ui/skeleton";
import { fetchSlimOrganizations, getDefaultOrganization, setDefaultOrganization } from "@/data/user/organizations";
import { getUserProfile } from "@/data/user/user";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { authUserMetadataSchema } from "@/utils/zod-schemas/authUserMetadata";
import { Suspense } from 'react';
import { UserOnboardingFlow } from "./OnboardingFlow";

async function getDefaultOrganizationOrSet(): Promise<string | null> {
  const [slimOrganizations, defaultOrganizationId] = await Promise.all([
    fetchSlimOrganizations(),
    getDefaultOrganization(),
  ]);
  console.log('slimOrganizations on onboarding', slimOrganizations);
  const firstOrganization = slimOrganizations[0];

  console.log('firstOrganization on onboarding', firstOrganization);
  if (defaultOrganizationId) {
    console.log('defaultOrganizationId on onboarding', defaultOrganizationId);
    return defaultOrganizationId;
  }

  if (!firstOrganization) {
    console.log('no firstOrganization on onboarding');
    return null;
  }

  // if the user has an organization already for some
  // reason, because of an invite or for some other reason,
  // make sure that the default organization is set to the first
  await setDefaultOrganization(firstOrganization.id);
  console.log('set default organization to firstOrganization on onboarding', firstOrganization.id);

  return firstOrganization.id;
}

async function getOnboardingConditions(userId: string) {
  const [userProfile, defaultOrganizationId] = await Promise.all([
    getUserProfile(userId),
    getDefaultOrganizationOrSet(),
  ]);

  console.log('userProfile on onboarding', userProfile);
  console.log('defaultOrganizationId on onboarding', defaultOrganizationId);
  return {
    userProfile,
    defaultOrganizationId,
  };
}

async function OnboardingFlowWrapper({ userId, userEmail }: { userId: string; userEmail: string | undefined }) {
  const [onboardingConditions, user] = await Promise.all([
    getOnboardingConditions(userId),
    serverGetLoggedInUser(),
  ]);
  const { userProfile } = onboardingConditions;
  console.log(userProfile);
  const onboardingStatus = authUserMetadataSchema.parse(user.user_metadata);
  console.log(onboardingStatus);
  console.log(userEmail);

  return (
    <UserOnboardingFlow
      userProfile={userProfile}
      onboardingStatus={onboardingStatus}
      userEmail={userEmail}
    />
  );
}

export default async function OnboardingPage() {
  const user = await serverGetLoggedInUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Suspense fallback={<Skeleton className="w-full max-w-md h-[400px]" />}>
        <OnboardingFlowWrapper userId={user.id} userEmail={user.email} />
      </Suspense>
    </div>
  );
}
