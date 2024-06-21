
import { fetchSlimOrganizations, getDefaultOrganization, setDefaultOrganization } from "@/data/user/organizations";
import { getUserProfile } from "@/data/user/user";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { authUserMetadataSchema } from "@/utils/zod-schemas/authUserMetadata";
import { UserOnboardingFlow } from "./OnboardingFlow";



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

  // if the user has an organization already for some
  // reason, because of an invite or for some other reason,
  // make sure that the default organization is set to the first
  await setDefaultOrganization(firstOrganization.id);

  return firstOrganization.id;
}

const getOnboardingConditions = async (userId: string) => {
  const [userProfile, defaultOrganizationId] = await Promise.all([
    getUserProfile(userId),
    getDefaultOrganizationOrSet(),
  ]);

  return {
    userProfile,
    defaultOrganizationId,
  };
};

export default async function Onboarding() {
  const user = await serverGetLoggedInUser();
  const {
    userProfile,
  } = await getOnboardingConditions(user.id)
  const onboardingStatus = authUserMetadataSchema.parse(user.user_metadata)
  return <div className="flex flex-col items-center justify-center h-full fixed inset-0">
    <UserOnboardingFlow
      userProfile={userProfile}
      onboardingStatus={onboardingStatus}
      userEmail={user.email}
    />
  </div>
}