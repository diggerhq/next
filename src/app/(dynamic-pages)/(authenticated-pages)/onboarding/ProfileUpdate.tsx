import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { updateUserProfileNameAndAvatar, uploadPublicUserAvatar } from "@/data/user/user";
import type { Table } from "@/types";
import { getUserAvatarUrl } from "@/utils/helpers";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

type ProfileUpdateProps = {
  userProfile: Table<"user_profiles">;
  onSuccess: () => void;
  userEmail: string | undefined;
};

export function ProfileUpdate({
  userProfile,
  onSuccess,
  userEmail,
}: ProfileUpdateProps) {
  const [fullName, setFullName] = useState(userProfile.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url ?? undefined);
  const { toast } = useToast();

  const avatarUrlWithFallback = getUserAvatarUrl({
    profileAvatarUrl: avatarUrl ?? userProfile.avatar_url,
    email: userEmail,
  });

  const updateProfileMutation = useMutation({
    mutationFn: () => updateUserProfileNameAndAvatar({ fullName, avatarUrl }, { isOnboardingFlow: true }),
    onSuccess: () => {
      toast({ title: "Profile updated!", description: "Your profile has been successfully updated." });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update profile", description: "Please try again.", variant: "destructive" });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadPublicUserAvatar(formData, file.name, { upsert: true });
    },
    onSuccess: (response) => {
      if (response.status === 'success') {
        setAvatarUrl(response.data);
        toast({ title: "Avatar uploaded!", description: "Your new avatar has been set." });
      }
    },
    onError: () => {
      toast({ title: "Error uploading avatar", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      updateProfileMutation.mutate();
    }}>
      <CardHeader>
        <CardTitle>Create Your Profile</CardTitle>
        <CardDescription>Let's set up your personal details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="avatar">Avatar</Label>
          <div className="flex items-center space-x-4">
            <Image
              width={48}
              height={48}
              className="rounded-full"
              src={avatarUrlWithFallback}
              alt="User avatar"
            />
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Input
                id="avatar-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                disabled={uploadAvatarMutation.isLoading}
              />
              <Button type="button" variant="outline" size="sm">
                {uploadAvatarMutation.isLoading ? "Uploading..." : "Change Avatar"}
              </Button>
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            disabled={updateProfileMutation.isLoading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={updateProfileMutation.isLoading || uploadAvatarMutation.isLoading}
        >
          {updateProfileMutation.isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </CardFooter>
    </form>
  );
}
