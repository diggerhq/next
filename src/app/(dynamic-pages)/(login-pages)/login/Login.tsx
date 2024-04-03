'use client';
import { Email } from '@/components/Auth/Email';
import { EmailAndPassword } from '@/components/Auth/EmailAndPassword';
import { RenderProviders } from '@/components/Auth/RenderProviders';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  signInWithMagicLink,
  signInWithPassword,
  signInWithProvider,
} from '@/data/auth/auth';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import type { AuthProvider } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Login({
  next,
  nextActionType,
}: {
  next?: string;
  nextActionType?: string;
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  function redirectToDashboard() {
    router.refresh();
    if (next) {
      router.push(`/auth/callback?next=${next}`);
    } else {
      router.push('/auth/callback');
    }
  }
  const magicLinkMutation = useSAToastMutation(
    async (email: string) => {
      return await signInWithMagicLink(email, next);
    },
    {
      loadingMessage: 'Sending magic link...',
      errorMessage(error) {
        try {
          if (error instanceof Error) {
            return String(error.message);
          }
          return `Send magic link failed ${String(error)}`;
        } catch (_err) {
          console.warn(_err);
          return 'Send magic link failed ';
        }
      },
      successMessage: 'A magic link has been sent to your email!',
      onSuccess: () => {
        setSuccessMessage('A magic link has been sent to your email!');
      },
    },
  );
  const passwordMutation = useSAToastMutation(
    async ({ email, password }: { email: string; password: string }) => {
      return await signInWithPassword(email, password);
    },
    {
      onSuccess: redirectToDashboard,
      loadingMessage: 'Logging in...',
      errorMessage(error) {
        try {
          if (error instanceof Error) {
            return String(error.message);
          }
          return `Sign in account failed ${String(error)}`;
        } catch (_err) {
          console.warn(_err);
          return 'Sign in account failed';
        }
      },
      successMessage: 'Logged in!',
    },
  );
  const providerMutation = useSAToastMutation(
    async (provider: AuthProvider) => {
      return signInWithProvider(provider, next);
    },
    {
      loadingMessage: 'Requesting login...',
      successMessage: 'Redirecting...',
      errorMessage: 'Failed to login',
    },
  );
  return (
    <div
      data-success={successMessage}
      className="container data-[success]:flex items-center data-[success]:justify-center text-left max-w-lg mx-auto overflow-auto data-[success]:h-full min-h-[470px]"
    >
      {successMessage ? (
        <Card className="p-8">
          <p className="text-blue-500 text-sm">{successMessage}</p>
        </Card>
      ) : (
        <div className="space-y-8 bg-background p-6 rounded-lg shadow dark:border">
          <Tabs defaultValue="password" className="md:min-w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              <TabsTrigger value="social-login">Social Login</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Login to NextBase</CardTitle>
                  <CardDescription>
                    Login with the account you used to signup.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <EmailAndPassword
                    isLoading={passwordMutation.isLoading}
                    onSubmit={(data) => {
                      passwordMutation.mutate(data);
                    }}
                    view="sign-in"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="magic-link">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Login to NextBase</CardTitle>
                  <CardDescription>
                    Login with magic link we will send to your email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <Email
                    onSubmit={(email) => magicLinkMutation.mutate(email)}
                    isLoading={magicLinkMutation.isLoading}
                    view="sign-in"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="social-login">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Login to NextBase</CardTitle>
                  <CardDescription>
                    Login with your social account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <RenderProviders
                    providers={['google', 'github', 'twitter']}
                    isLoading={providerMutation.isLoading}
                    onProviderLoginRequested={providerMutation.mutate}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
