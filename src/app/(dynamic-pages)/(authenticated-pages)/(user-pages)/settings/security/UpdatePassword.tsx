'use client';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePasswordAction } from '@/data/user/security';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
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
    <>
      <CardContent className="flex flex-col gap-2 w-full">
        <Label htmlFor="email" className="text-muted-foreground">
          Password
        </Label>
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="password"
            className='w-full'
            required
            {...passwordInput}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          aria-disabled={isLoading}
          type="button"
          className="w-full"
          onClick={() => {
            updatePassword();
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </Button>
      </CardFooter>
    </>
  );
};
