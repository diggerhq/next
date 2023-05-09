'use client';
import { Password } from '@/components/presentational/tailwind/Auth/Password';
import { useUpdatePassword } from '@/utils/react-query-hooks';
import { useRouter } from 'next/navigation';

export function UpdatePassword() {
  const router = useRouter();
  const updatePasswordMutation = useUpdatePassword({
    onSuccess: () => {
      router.push('/check-auth');
    },
  });

  return (
    <div className="container h-full grid items-center text-left max-w-lg mx-auto overflow-auto">
      <div className="space-y-8 ">
        {/* <Auth providers={['twitter']} supabaseClient={supabase} /> */}
        <div className="flex flex-col items-start gap-0 w-[320px]">
          <p className="text-xl font-[700]">Reset Password</p>
          <p className="text-base text-left font-[400]">
            Create a strong new password for your account
          </p>
        </div>

        <Password
          isLoading={updatePasswordMutation.isLoading}
          onSubmit={(password) => {
            updatePasswordMutation.mutate({
              password,
            });
          }}
          label="Create your new Password"
          withMaintenanceMode
          buttonLabel="Confirm Password"
        />
      </div>
    </div>
  );
}
