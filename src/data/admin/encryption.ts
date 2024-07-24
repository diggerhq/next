import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { EnvVar } from '@/types/userTypes';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function deriveKey(projectId: string, salt: Buffer): Promise<Buffer> {
  // Combine masterPassword, projectId, and salt to create a unique key
  const keyMaterial = process.env.MASTER_PASSWORD + projectId;
  return scryptAsync(keyMaterial, salt, 32) as Promise<Buffer>;
}

export async function encrypt(
  text: string,
  projectId: string,
): Promise<string> {
  const iv = randomBytes(12);
  const salt = randomBytes(16);
  const key = await deriveKey(projectId, salt);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  // Combine salt, IV, auth tag, and encrypted data
  return (
    salt.toString('base64') +
    '.' +
    iv.toString('base64') +
    '.' +
    authTag.toString('base64') +
    '.' +
    encrypted
  );
}

export async function decrypt(
  encryptedText: string,
  projectId: string,
): Promise<string> {
  const [saltBase64, ivBase64, authTagBase64, encryptedData] =
    encryptedText.split('.');
  const salt = Buffer.from(saltBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  const key = await deriveKey(projectId, salt);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
export async function storeEncryptedEnvVar(
  projectId: string,
  name: string,
  value: string,
  isSecret: boolean,
  masterPassword: string,
  salt: string,
) {
  console.log('Encryption: Storing encrypted var:', {
    projectId,
    name,
    isSecret,
  });
  const encrypted = await encrypt(value, projectId);

  const { data, error } = await supabaseAdminClient
    .from('encrypted_env_vars')
    .upsert(
      {
        project_id: projectId,
        name,
        encrypted_value: encrypted,
        is_secret: isSecret,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'project_id,name',
      },
    );

  if (error) {
    console.error('Encryption: Error storing variable:', error);
    throw error;
  }
  console.log('Encryption: Variable stored successfully');
  return data;
}
export async function getDecryptedEnvVar(
  projectId: string,
  name: string,
  masterPassword: string,
) {
  const { data, error } = await supabaseAdminClient
    .from('encrypted_env_vars')
    .select('encrypted_value, is_secret')
    .eq('project_id', projectId)
    .eq('name', name)
    .single();

  if (error) throw error;
  if (data.is_secret) {
    return { value: null, isSecret: true };
  }
  const decryptedValue = await decrypt(data.encrypted_value, projectId);
  return { value: decryptedValue, isSecret: false };
}

export async function getAllEnvVarNames(projectId: string) {
  const { data, error } = await supabaseAdminClient
    .from('encrypted_env_vars')
    .select('name, is_secret')
    .eq('project_id', projectId);

  if (error) throw error;
  return data;
}

export async function deleteEnvVar(projectId: string, name: string) {
  const { error } = await supabaseAdminClient
    .from('encrypted_env_vars')
    .delete()
    .eq('project_id', projectId)
    .eq('name', name);

  if (error) throw error;
}

export async function getAllEnvVars(
  projectId: string,
  masterPassword: string,
  salt: string,
): Promise<EnvVar[]> {
  const { data, error } = await supabaseAdminClient
    .from('encrypted_env_vars')
    .select('name, encrypted_value, is_secret, updated_at')
    .eq('project_id', projectId);

  if (error) throw error;

  console.log('Fetched data:', data);
  // convert bytea to string
  return Promise.all(
    data.map(async (item) => {
      console.log(item.encrypted_value);
      try {
        return {
          name: item.name,
          value: item.is_secret
            ? '********'
            : await decrypt(item.encrypted_value, projectId),
          is_secret: item.is_secret,
          updated_at: item.updated_at,
        };
      } catch (error) {
        console.error(`Error processing item ${item.name}:`, error);
        return {
          name: item.name,
          value: '[Error: Unable to decrypt]',
          is_secret: item.is_secret,
          updated_at: item.updated_at,
        };
      }
    }),
  );
}
