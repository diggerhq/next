import { useRef, useState } from 'react';

import { Label } from '@/components/ui/label';
import { getUserAvatarUrl } from '@/utils/helpers';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../Button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { T } from '../ui/Typography';
const MotionImage = motion(Image);

export function UpdateAvatarAndNameBody({
  onSubmit,
  isLoading,
  onFileUpload,
  isUploading,
  profileAvatarUrl,
  profileFullname,
  isNewAvatarImageLoading,
  setIsNewAvatarImageLoading,
  userEmail,
  userId
}: {
  profileAvatarUrl: string | undefined;
  isUploading: boolean;
  onSubmit: (fullName: string) => void;
  isLoading: boolean;
  onFileUpload?: (file: File) => void;
  profileFullname: string | undefined;
  isNewAvatarImageLoading: boolean;
  setIsNewAvatarImageLoading: (value: boolean) => void;
  userEmail: string | undefined;
  userId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profileFullname ?? userEmail ?? `User ${userId}`);
  const avatarURL = getUserAvatarUrl({
    profileAvatarUrl,
    email: userEmail,
  });
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(fullName);
      }}
      className="flex gap-6 w-full"
    >
      <div className='w-full'>
        <div className='flex flex-row items-start gap-6'>
          <div className="">
            <div className="relative mt-1 group w-fit">
              <Label
                className="inline-block cursor-pointer w-fit"
                htmlFor="file-input"
              >
                <MotionImage
                  animate={{
                    opacity: isNewAvatarImageLoading ? [0.5, 1, 0.5] : 1,
                  }}
                  transition={
                    isNewAvatarImageLoading
                      ? {
                        duration: 1,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }
                      : undefined
                  }
                  onLoad={() => setIsNewAvatarImageLoading(false)}
                  onError={() => setIsNewAvatarImageLoading(false)}
                  width={72}
                  height={80}
                  className="rounded-full object-cover border-2 border-gray-200 transition-all duration-300 group-hover:border-primary"
                  src={avatarURL}
                  alt="Avatar"
                />
                <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="size-4 text-primary-foreground" />
                </div>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                id="file-input"
                className="hidden"
                accept="image/*"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && onFileUpload) {
                    onFileUpload(file);
                  }
                }}
              />
            </div>
          </div>
          <div className="space-y-1 w-3/4">
            <Label htmlFor="name">
              Full name
            </Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
              className='w-full'
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className='mt-5 w-fit'
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>

      <Separator orientation='vertical' className='h-[96px]' />

      <div className='ml-4 w-full'>
        <div className="space-y-1 w-3/4">
          <Label htmlFor="name">
            User name
          </Label>
          <Input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your user name"
            disabled
            className='w-full mb-2 '
          />
          <T.Small className="mt-2 text-muted-foreground font-normal">
            Username cannot be changed
          </T.Small>
        </div>
      </div>
    </form>
  );
}
