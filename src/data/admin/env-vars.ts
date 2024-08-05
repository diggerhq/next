'use server';

import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { EnvVar } from '@/types/userTypes';
import { constants, publicEncrypt } from 'crypto';

export async function encryptSecretWithPublicKey(
  text: string,
  publicKey: string,
): Promise<string> {
  if (!publicKey) {
    console.error('No secrets key in the org');
    throw new Error('No secrets key in the org');
  }
  const buffer = Buffer.from(text, 'utf8');
  const encrypted = publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );
  return encrypted.toString('base64');
}

export async function getOrganizationPublicKey(
  orgId: string,
): Promise<string | null> {
  const { data: publicKeyData, error } = await supabaseAdminClient
    .from('organizations')
    .select('public_key')
    .eq('id', orgId)
    .single();

  if (error) {
    console.error('Error fetching public key:', error);
    throw error;
  }

  return publicKeyData?.public_key || null;
}

export async function storeEnvVar(
  projectId: string,
  orgId: string,
  name: string,
  value: string,
  isSecret: boolean,
) {
  let storedValue;
  if (isSecret) {
    const publicKey = await getOrganizationPublicKey(orgId);
    if (!publicKey) {
      throw new Error('Cannot encrypt secret - no public key');
    }
    storedValue = await encryptSecretWithPublicKey(value, publicKey);
  } else {
    storedValue = value;
  }

  const { data, error } = await supabaseAdminClient.from('env_vars').upsert(
    {
      project_id: projectId,
      name,
      value: storedValue,
      is_secret: isSecret,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'project_id,name',
    },
  );

  if (error) {
    console.error('Error storing variable:', error);
    throw error;
  }
  console.log('Variable stored successfully:', { name, isSecret });
  return data;
}
export async function getEnvVar(projectId: string, name: string) {
  const { data, error } = await supabaseAdminClient
    .from('env_vars')
    .select('value, is_secret')
    .eq('project_id', projectId)
    .eq('name', name)
    .single();

  if (error) throw error;
  if (data.is_secret) {
    return { value: null, isSecret: true };
  } else {
    return { value: data.value, isSecret: false };
  }
}

export async function getAllEnvVarNames(projectId: string) {
  const { data, error } = await supabaseAdminClient
    .from('env_vars')
    .select('name, is_secret')
    .eq('project_id', projectId);

  if (error) throw error;
  return data;
}

export async function deleteEnvVar(projectId: string, name: string) {
  const { error } = await supabaseAdminClient
    .from('env_vars')
    .delete()
    .eq('project_id', projectId)
    .eq('name', name);

  if (error) throw error;
}

export async function getAllEnvVars(projectId: string): Promise<EnvVar[]> {
  const { data, error } = await supabaseAdminClient
    .from('env_vars')
    .select('name, value, is_secret, updated_at')
    .eq('project_id', projectId);

  if (error) throw error;

  // convert bytea to string
  return Promise.all(
    data.map(async (item) => {
      console.log(item.value);
      try {
        return {
          name: item.name,
          value: item.is_secret ? '********' : item.value,
          is_secret: item.is_secret,
          updated_at: item.updated_at,
        };
      } catch (error) {
        console.error(`Error processing item ${item.name}:`, error);
        return {
          name: item.name,
          value: '[Error: Unable to get env vars]',
          is_secret: item.is_secret,
          updated_at: item.updated_at,
        };
      }
    }),
  );
}
