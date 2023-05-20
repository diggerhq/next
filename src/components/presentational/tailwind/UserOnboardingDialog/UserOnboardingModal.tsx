import { Button } from '@/components/ui/Button';
import { useLoggedInUser } from '@/hooks/useLoggedInUser';
import { getUserAvatarUrl } from '@/utils/helpers';
import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { motion } from 'framer-motion';
import { useLoggedInUserEmail } from '@/hooks/useLoggedInUserEmail';
import Image from 'next/image';

const MotionImage = motion(Image);

export const UserOnboardingDialog = ({
  isOpen,
  onSubmit,
  isLoading,
  onFileUpload,
  isUploading,
  profileAvatarUrl,
}: {
  isOpen: boolean;
  profileAvatarUrl?: string;
  isUploading: boolean;
  onSubmit: (fullName: string) => void;
  isLoading: boolean;
  onFileUpload?: (file: File) => void;
}) => {
  const user = useLoggedInUser();
  const [fullName, setFullName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userEmail = useLoggedInUserEmail();
  const avatarURL = getUserAvatarUrl({
    profileAvatarUrl,
    email: userEmail,
  });
  const [hasImageLoaded, setHasImageLoaded] = useState(false);

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tell us about you</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(fullName);
            setFullName('');
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <DialogDescription>Photo</DialogDescription>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <div className="flex items-center">
                  <MotionImage
                    animate={{
                      opacity: hasImageLoaded ? 1 : 0.8,
                    }}
                    transition={
                      hasImageLoaded
                        ? undefined
                        : {
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: 'reverse',
                          }
                    }
                    onLoadingComplete={() => {
                      setHasImageLoaded(true);
                    }}
                    onLoadStart={() => {
                      setHasImageLoaded(false);
                    }}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGg0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    loading="eager"
                    width={24}
                    height={24}
                    className="h-12 w-12 rounded-full"
                    src={avatarURL}
                    alt="avatarUrl"
                  />
                  <button
                    type="button"
                    className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Please wait...' : 'Change'}
                  </button>
                  <input
                    disabled={isUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        onFileUpload?.(file);
                      }
                    }}
                    ref={fileInputRef}
                    type="file"
                    id="file-input"
                    hidden
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <DialogDescription>Name</DialogDescription>
              <input
                disabled={isLoading}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                type="text"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="my-2"
              variant="success"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
