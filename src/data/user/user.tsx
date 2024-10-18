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
import { PrismaClient, user_profiles } from '@prisma/client';
import {
  getUserPendingInvitationsByEmail as userPendingInvitationsByEmailSQL,
  getUserPendingInvitationsById as userPendingInvitationsByIdSQL
} from '@prisma/client/sql';
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
  const prisma = new PrismaClient();
  try {
    const data = await prisma.user_profiles.findUnique({
      where: {
        id: userId
      }
    })

    if (!data) {
      throw new Error('User profile not found')
    }

    return data
  } catch (error) {
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const getUserProfileByEmail = async (email: string) => {
  const prisma = new PrismaClient()

  try {
    const data = await prisma.user_profiles.findUnique({
      where: {
        email: email
      }
    })

    if (!data) {
      throw new Error('User profile not found')
    }

    return data
  } catch (error) {
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const getUserProfileByEmailOrCreate = async (email: string) => {
  const prisma = new PrismaClient()

  try {
    const existingProfile = await prisma.user_profiles.findUnique({
      where: { email }
    })

    if (existingProfile) {
      return existingProfile
    }

    // If the profile doesn't exist, create a new one
    const newProfile = await prisma.user_profiles.create({
      data: {
        id: uuidv4(),
        email
      }
    })

    return newProfile

  } catch (error) {
    console.log('Error in getUserProfileByEmailOrCreate:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const getUserFullName = async (userId: string) => {
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user_profiles.findUnique({
      where: { id: userId },
      select: { full_name: true }
    })

    if (!user) {
      throw new Error('User not found');
    }

    return user.full_name
  } catch (error) {
    console.error('Error in getUserFullName:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const getUserAvatarUrl = async (userId: string) => {
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user_profiles.findUnique({
      where: { id: userId },
      select: { avatar_url: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.avatar_url;
  } catch (error) {
    console.error('Error in getUserAvatarUrl:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getUserPendingInvitationsByEmail = async (userEmail: string) => {
  const prisma = new PrismaClient();

  try {
    const invitations = await prisma.$queryRawTyped(userPendingInvitationsByEmailSQL(userEmail));
    return invitations;
  } catch (error) {
    console.error('Error in getUserPendingInvitationsByEmail:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getUserPendingInvitationsById = async (userId: string) => {
  const prisma = new PrismaClient();

  try {
    const invitations = await prisma.$queryRawTyped(userPendingInvitationsByIdSQL(userId));
    return invitations;
  } catch (error) {
    console.error('Error in getUserPendingInvitationsByEmail:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
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
  const prisma = new PrismaClient()
  try {
    const data = await prisma.user_profiles.update({
      where: { id: userId },
      data: metadata,
    })

    return data
  } catch (error) {
    throw error
  } finally {
    await prisma.$disconnect()
  }
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
): Promise<SAPayload<user_profiles>> => {
  "use server";
  const prisma = new PrismaClient()

  try {
    const user = await serverGetLoggedInUser()

    const data = await prisma.user_profiles.update({
      where: { id: user.id },
      data: {
        full_name: fullName,
        user_name: userName,
        avatar_url: avatarUrl,
      },
    })

    if (isOnboardingFlow) {
      await updateUserProfileMetadata(user.id, { has_completed_profile: true })

      const refreshSessionResponse = await refreshSessionAction()
      if (refreshSessionResponse.status === "error") {
        return refreshSessionResponse
      }

      revalidatePath("/", "layout")
    }

    return {
      status: "success",
      data,
    }
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    }
  } finally {
    await prisma.$disconnect()
  }
}

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
