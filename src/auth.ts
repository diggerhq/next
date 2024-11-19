import type { OAuthConfig } from '@auth/core/providers';
import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import Okta from 'next-auth/providers/okta';

function getAuthProviders() : OAuthConfig<any>[] {
  const providers : OAuthConfig<any>[] = []
  if (process.env.AUTH_PROVIDER_AUTH0_ENABLED==="1") {
    providers.push(Auth0({
      authorization: { params: { prompt: 'login' } },
    }))
  }
  if (process.env.AUTH_PROVIDER_OKTA_ENABLED==="1") {
    providers.push(Okta({
      authorization: { params: { prompt: 'login' } },
    }))
  }
  return providers
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  //providers: [WorkOS({ connection: 'conn_01HVH5N4RFQVD9DH5QWGYT844V' })],
  providers: getAuthProviders(),
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
  },
});
