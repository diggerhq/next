import { getM2MApplication } from '@/data/user/m2m';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
export async function validateM2MToken(token: string) {
  try {
    // Decode without verification to get clientId
    const decoded = decodeJwt(token);
    const clientId = String(decoded.azp) || String(decoded.client_id);

    // Only verify if this clientId is registered in our system
    const m2mApp = await getM2MApplication(clientId);
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
