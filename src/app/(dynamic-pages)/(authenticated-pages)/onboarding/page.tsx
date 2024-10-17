import { Skeleton } from "@/components/ui/skeleton";
import { fetchSlimOrganizations, getDefaultOrganization, setDefaultOrganization } from "@/data/user/organizations";
import { getUserProfileByEmailOrCreate } from "@/data/user/user";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { authUserMetadataSchema } from "@/utils/zod-schemas/authUserMetadata";
import { Suspense } from 'react';
import { UserOnboardingFlow } from "./OnboardingFlow";

async function getDefaultOrganizationOrSet(): Promise<string | null> {
  console.log(`get default organisation`)
  try {
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
    console.log('Set default organization to firstOrganization on onboarding', firstOrganization.id);

    return firstOrganization.id;
  } catch (error) {
    // this means that getDefaultOrganization() threw an error (bc fetchSlimOrganizations() always returns)
    console.log('No default organization on onboarding');
    return null;
  }

}

//TODO rename / refactor: it also creates profile. Temporary workaround.
async function getOnboardingConditions(email: string) {

  const [userProfile, defaultOrganizationId] = await Promise.all([
    getUserProfileByEmailOrCreate(email),
    getDefaultOrganizationOrSet(),
  ]);

  console.log('userProfile on onboarding', userProfile);
  console.log('defaultOrganizationId on onboarding', defaultOrganizationId);
  return {
    userProfile,
    defaultOrganizationId,
  };
}

async function OnboardingFlowWrapper({ userEmail }: { userEmail: string }) {
  const { userProfile } = await getOnboardingConditions(userEmail)
  console.log("Conditions got - profile", userProfile);
  //TODO use actual user metadata instead of dummy
  const dummyMetadata = authUserMetadataSchema.parse({
    onboardingHasAcceptedTerms: true,
    onboardingHasCompletedProfile: false,
    onboardingHasCreatedOrganization: false,
    isUserCreatedThroughOrgInvitation: false,
  })
  const onboardingStatus = dummyMetadata

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
        <OnboardingFlowWrapper userEmail={user.email} />
      </Suspense>
    </div>
  );
}
