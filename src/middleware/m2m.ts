import { PrismaClient } from '@prisma/client';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
export async function validateM2MToken(token: string) {
  try {
    // Decode without verification to get clientId
    const decoded = decodeJwt(token);
    const clientId = decoded.azp || decoded.client_id;

    // Only verify if this clientId is registered in our system
    const prisma = new PrismaClient();
    const m2mApp = await prisma.user_m2m_applications.findFirst({
      where: { clientId: clientId || '' },
    });

    if (!m2mApp) {
      console.log('No matching M2M application found for client ID:', clientId);
      return null;
    }

    console.log('verifying app for:', m2mApp.email);

    // Verify the token
    const auth0Domain = m2mApp.issuer;
    const audience = m2mApp.audience;

    const jwks = createRemoteJWKSet(
      new URL(`${auth0Domain}/.well-known/jwks.json`),
    );

    const { payload } = await jwtVerify(token, jwks, {
      audience,
      issuer: `${auth0Domain}/`,
    });

    return {
      payload,
      email: m2mApp.email,
      m2mApp,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}
