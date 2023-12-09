'use client';
import { UserOnboardingDialog } from '@/components/presentational/tailwind/UserOnboardingDialog';
import {
  updateUserProfileNameAndAvatar,
  uploadPublicUserAvatar,
} from '@/data/user/user';
import { useToastMutation } from '@/hooks/useToastMutation';
import { Table } from '@/types';
import { useRouter } from 'next/navigation';

export function UserOnboardingFlow({
  userProfile,
  onSuccess,
}: {
  userProfile: Table<'user_profiles'>;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const { mutate: updateProfile, isLoading: isUpdatingProfile } =
    useToastMutation(
      async ({
        fullName,
        avatarUrl,
      }: {
        fullName: string;
        avatarUrl?: string;
      }) => {
        return await updateUserProfileNameAndAvatar({ fullName, avatarUrl });
      },
      {
        loadingMessage: 'Updating profile...',
        successMessage: 'Profile updated!',
        errorMessage: 'Error updating profile',
        onSuccess: () => {
          onSuccess();
          router.refresh();
        },
      },
    );

  const { mutate: uploadFile, isLoading: isUploading } = useToastMutation(
    async (file: File) => {
      return uploadPublicUserAvatar(file, file.name, {
        upsert: true,
      });
    },
    {
      loadingMessage: 'Uploading avatar...',
      successMessage: 'Avatar uploaded!',
      errorMessage: 'Error uploading avatar',
      onSuccess: () => {
        router.refresh();
      },
    },
  );

  return (
    <UserOnboardingDialog
      isOpen
      onSubmit={(fullName: string) => {
        updateProfile({
          fullName,
        });
      }}
      onFileUpload={(file: File) => {
        uploadFile(file);
      }}
      profileAvatarUrl={userProfile.avatar_url ?? undefined}
      isUploading={isUploading}
      isLoading={isUpdatingProfile ?? isUploading}
    />
  );
}
