import crypto from 'crypto';

//TODO remove old encryption
export function encryptWithPublicKeyOld(text: string, publicKey: string) {
  const buffer = Buffer.from(text, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );
  return encrypted.toString('base64');
}

export function encryptWithPublicKey(
  data: string,
  publicKeyPEM: string,
): string {
  // Ensure the public key has the correct PEM format
  const formattedPublicKey = publicKeyPEM.includes('-----BEGIN PUBLIC KEY-----')
    ? publicKeyPEM
    : `-----BEGIN PUBLIC KEY-----\n${publicKeyPEM}\n-----END PUBLIC KEY-----`;

  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: formattedPublicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer,
  );
  return encrypted.toString('base64');
}

export function decryptWithPrivateKey(
  encryptedText: string,
  privateKey: string,
) {
  const buffer = Buffer.from(encryptedText, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );
  return decrypted.toString('utf8');
}

export function formatKey(key: string, type: 'public' | 'private'): string {
  const header =
    type === 'public'
      ? '-----BEGIN PUBLIC KEY-----'
      : '-----BEGIN PRIVATE KEY-----';
  const footer =
    type === 'public'
      ? '-----END PUBLIC KEY-----'
      : '-----END PRIVATE KEY-----';

  // Remove any existing headers and footers
  let cleanedKey = key.replace(
    /-----BEGIN (PUBLIC|PRIVATE) KEY-----|-----END (PUBLIC|PRIVATE) KEY-----/g,
    '',
  );

  // Replace '\n' with actual newlines and remove any extra whitespace
  cleanedKey = cleanedKey.replace(/\\n/g, '\n').replace(/\s+/g, '\n').trim();

  // Ensure the key is in the correct format
  return `${header}\n${cleanedKey}\n${footer}`;
}
