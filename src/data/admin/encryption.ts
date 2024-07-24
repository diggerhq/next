import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  randomBytes,
} from 'crypto';

function deriveKey(password: string, salt: string): Buffer {
  return pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

function encrypt(
  text: string,
  ENCRYPTION_SALT: string,
  MASTER_PASSWORD: string,
): { iv: string; encryptedData: string } {
  const iv = randomBytes(16);
  const key = deriveKey(MASTER_PASSWORD, ENCRYPTION_SALT);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
}

function decrypt(
  iv: string,
  encryptedData: string,
  ENCRYPTION_SALT: string,
  MASTER_PASSWORD: string,
): string {
  const key = deriveKey(MASTER_PASSWORD, ENCRYPTION_SALT);
  const decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
