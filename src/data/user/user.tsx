"use server";
import { PRODUCT_NAME } from "@/constants";
import { generateOrganizationSlug } from "@/lib/utils";
import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import type { SAPayload, SupabaseFileUploadOptions, Table } from "@/types";
import { sendEmail } from "@/utils/api-routes/utils";
import { toSiteURL } from "@/utils/helpers";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import type { AuthUserMetadata } from "@/utils/zod-schemas/authUserMetadata";
import { renderAsync } from "@react-email/render";
import ConfirmAccountDeletionEmail from "emails/account-deletion-request";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import urlJoin from "url-join";
import { v4 as uuidv4 } from 'uuid';
import { acceptInvitationAction } from "./invitation";
import { createOrganization, setDefaultOrganization } from "./organizations";
import { refreshSessionAction } from "./session";

export async function getIsAppAdmin(): Promise<boolean> {
  const user = await serverGetLoggedInUser();
  if ("user_role" in user) {
    return user.user_role === "admin";
  }
  return false;
}

export const getUserProfile = async (userId: string) => {
  console.log(`get user profile ${userId}`)
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserProfileByEmail = async (email: string) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserProfileByEmailOrCreate = async (email: string) => {
  const supabase = createSupabaseUserServerComponentClient();
  try {
    // Try to get the existing user profile
    const existingProfile = await getUserProfileByEmail(email);
    return existingProfile;
  } catch (error) {
    // If the profile doesn't exist, create a new one
    // TODO filter error by code PGRST116 or details "the result contains 0 rows"
    const { data, error: createError } = await supabase
      .from("user_profiles")
      .insert({ id: uuidv4(), email })
      .select()
      .single();

    if (createError) {
      console.log('creating profil error', createError);
      throw createError;
    }

    return data;

  }
};

export const getUserFullName = async (userId: string) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data.full_name;
};

export const getUserAvatarUrl = async (userId: string) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data.avatar_url;
};

export const getUserPendingInvitationsByEmail = async (userEmail: string) => {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("organization_join_invitations")
    .select(
      "*, inviter:user_profiles!inviter_user_id(*), invitee:user_profiles!invitee_user_id(*), organization:organizations(*)",
    )
    .ilike("invitee_user_email", `%${userEmail}%`)
    .eq("status", "active");

  if (error) {
    throw error;
  }

  return data || [];
};

export const getUserPendingInvitationsById = async (userId: string) => {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("organization_join_invitations")
    .select(
      "*, inviter:user_profiles!inviter_user_id(*), invitee:user_profiles!invitee_user_id(*), organization:organizations(*)",
    )
    .eq("invitee_user_id", userId)
    .eq("status", "active");

  if (error) {
    throw error;
  }

  return data || [];
};

export const uploadPublicUserAvatar = async (
  formData: FormData,
  fileName: string,
  fileOptions?: SupabaseFileUploadOptions | undefined,
): Promise<SAPayload<string>> => {
  "use server";
  const file = formData.get("file");
  if (!file) {
    throw new Error("File is empty");
  }
  const slugifiedFilename = slugify(fileName, {
    lower: true,
    strict: true,
    replacement: "-",
  });
  const supabaseClient = createSupabaseUserServerActionClient();
  const user = await serverGetLoggedInUser();
  const userId = user.id;
  const userImagesPath = `${userId}/images/${slugifiedFilename}`;

  const { data, error } = await supabaseClient.storage
    .from("public-user-assets")
    .upload(userImagesPath, file, fileOptions);

  if (error) {
    return { status: "error", message: error.message };
  }

  const { path } = data;

  const filePath = path.split(",")[0];
  const supabaseFileUrl = urlJoin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "/storage/v1/object/public/public-user-assets",
    filePath,
  );

  return { status: "success", data: supabaseFileUrl };
};

export async function updateUserProfileMetadata(userId: string, metadata: {
  has_accepted_terms?: boolean,
  has_completed_profile?: boolean,
  has_created_organization?: boolean,
  is_created_through_org_invitation?: boolean,
}) {
  const supabaseClient = createSupabaseUserServerActionClient();

  const { data, error } = await supabaseClient
    .from("user_profiles")
    .update(metadata)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export const updateUserProfileNameAndAvatar = async (
  {
    fullName,
    userName,
    avatarUrl,
  }: {
    fullName?: string;
    userName?: string;
    avatarUrl?: string;
  },
  {
    isOnboardingFlow = false,
  }: {
    isOnboardingFlow?: boolean;
  } = {},
): Promise<SAPayload<Table<"user_profiles">>> => {
  "use server";
  const supabaseClient = createSupabaseUserServerActionClient();
  const user = await serverGetLoggedInUser();
  const { data, error } = await supabaseClient
    .from("user_profiles")
    .update({
      full_name: fullName,
      user_name: userName,
      avatar_url: avatarUrl,
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  if (isOnboardingFlow) {

    try {
      await updateUserProfileMetadata(user.id, { has_completed_profile: true });
    } catch (e) {
      return {
        status: "error",
        message: e.message,
      };
    }

    const refreshSessionResponse = await refreshSessionAction();
    if (refreshSessionResponse.status === "error") {
      return refreshSessionResponse;
    }

    revalidatePath("/", "layout");
  }

  return {
    status: "success",
    data,
  };
};

export const acceptTermsOfService = async (
  accepted: boolean,
): Promise<SAPayload<boolean>> => {
  const supabaseClient = createSupabaseUserServerComponentClient();

  const updateUserMetadataPayload: Partial<AuthUserMetadata> = {
    onboardingHasAcceptedTerms: true,
  };

  const updateUserMetadataResponse = await supabaseClient.auth.updateUser({
    data: updateUserMetadataPayload,
  });

  if (updateUserMetadataResponse.error) {
    return {
      status: "error",
      message: updateUserMetadataResponse.error.message,
    };
  }

  const refreshSessionResponse = await refreshSessionAction();
  if (refreshSessionResponse.status === "error") {
    return refreshSessionResponse;
  }

  return {
    status: "success",
    data: true,
  };
};


export const autoAcceptFirstInvitation = async () => {
  const user = await serverGetLoggedInUser();
  const pendingInvitations = await getUserPendingInvitationsById(user.id);
  const supabaseClient = createSupabaseUserServerActionClient();

  if (pendingInvitations.length > 0) {
    const invitation = pendingInvitations[0];
    const invitationAcceptanceResponse = await acceptInvitationAction(invitation.id);
    if (invitationAcceptanceResponse.status === "error") {
      throw invitationAcceptanceResponse.message;
    } else if (invitationAcceptanceResponse.status === "success") {
      const joinedOrganizationId = invitationAcceptanceResponse.data;
      // let's make the joined organization the default one
      await setDefaultOrganization(joinedOrganizationId);
    }
    const userProfile = await getUserProfile(user.id);
    const userFullName = userProfile?.full_name ?? `User ${user.email ?? ""}`;
    const defaultOrganizationCreationResponse = await createOrganization(userFullName, generateOrganizationSlug(userFullName));

    if (defaultOrganizationCreationResponse.status === "error") {
      throw defaultOrganizationCreationResponse.message;
    }
  }

  console.log('updating user metadata')


  const updateUserMetadataPayload: Partial<AuthUserMetadata> = {
    onboardingHasCreatedOrganization: true,
  };

  const updateUserMetadataResponse = await supabaseClient.auth.updateUser({
    data: updateUserMetadataPayload,
  });

  if (updateUserMetadataResponse.error) {
    return {
      status: "error",
      message: updateUserMetadataResponse.error.message,
    };
  }

  const refreshSessionResponse = await refreshSessionAction();
  if (refreshSessionResponse.status === "error") {
    return refreshSessionResponse;
  }

  return {
    status: "success",
    data: true,
  };
}

export async function requestAccountDeletion(): Promise<
  SAPayload<Table<"account_delete_tokens">>
> {
  const supabaseClient = createSupabaseUserServerActionClient();
  const user = await serverGetLoggedInUser();
  if (!user.email) {
    return { status: "error", message: "User email not found" };
  }
  const { data, error } = await supabaseClient
    .from("account_delete_tokens")
    .upsert({
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    return { status: "error", message: error.message };
  }

  const userFullName =
    (await getUserFullName(user.id)) ?? `User ${user.email ?? ""}`;

  const deletionHTML = await renderAsync(
    <ConfirmAccountDeletionEmail
      deletionConfirmationLink={toSiteURL(`/confirm-delete-user/${data.token}`)}
      userName={userFullName}
      appName={PRODUCT_NAME}
    />,
  );

  await sendEmail({
    from: process.env.ADMIN_EMAIL,
    html: deletionHTML,
    subject: `Confirm Account Deletion - ${PRODUCT_NAME}`,
    to: user.email,
  });

  return {
    status: "success",
    data,
  };
}

export async function setOnboardingStatus(): Promise<
  SAPayload<undefined>
> {
  const user = await serverGetLoggedInUser();
  const userId = user.id;
  const supabaseClient = createSupabaseUserServerActionClient();

  const updateAuthUser = await supabaseClient.auth.updateUser({
    data: {
      onboarding_status: "nah",
    },
  });

  if (updateAuthUser.error) {
    return {
      status: "error",
      message: updateAuthUser.error.message,
    };
  }

  const refreshSessionResponse = await supabaseClient.auth.refreshSession();

  if (refreshSessionResponse.error) {
    return {
      status: "error",
      message: refreshSessionResponse.error.message,
    };
  }

  return {
    status: "success",
    data: undefined,
  };
}
