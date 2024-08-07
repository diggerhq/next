'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePasswordAction } from '@/data/user/security';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { classNames } from '@/utils/classNames';
import { useInput } from 'rooks';

export const UpdatePassword = () => {
  const passwordInput = useInput('');
  const { mutate: updatePassword, isLoading } = useSAToastMutation(
    async () => {
      return await updatePasswordAction(passwordInput.value);
    },
    {
      loadingMessage: 'Updating password...',
      successMessage: 'Password updated!',
      errorMessage(error) {
        try {
          if (error instanceof Error) {
            return String(error.message);
          }
          return `Update password failed ${String(error)}`;
        } catch (_err) {
          console.warn(_err);
          return 'Update password failed';
        }
      },
    },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 w-1/3">
        <Label htmlFor="email" className="text-muted-foreground">
          Password
        </Label>
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="password"
            required
            {...passwordInput}
          />
        </div>
        <Button
          aria-disabled={isLoading}
          type="button"
          onClick={() => {
            updatePassword();
          }}
          className={classNames(
            'flex w-fit justify-center rounded-lg border border-transparent py-3 text-white dark:text-black px-4 text-sm font-medium  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
            isLoading
              ? 'bg-yellow-300 dark:bg-yellow-700 '
              : 'bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100  ',
          )}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </Button>
      </div>
    </div>
  );
};
