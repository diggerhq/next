'use server';

import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { SAPayload, Table } from '@/types';
import { EnvVar } from '@/types/userTypes';
import { encryptWithPublicKey, formatKey } from '@/utils/crypto';
import crypto, { constants, privateDecrypt, publicEncrypt } from 'crypto';
import { revalidatePath } from 'next/cache';
import { tfvarsOnBulkUpdate } from '../user/tfvars';

export async function encryptSecretWithPublicKey(
  text: string,
  publicKey: string,
): Promise<string> {
  if (!publicKey) {
    throw new Error('No secrets key in the org');
  }

  // Ensure the public key has the correct PEM format for encryption
  const formattedPublicKey = publicKey.includes('-----BEGIN PUBLIC KEY-----')
    ? publicKey
    : `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

  const buffer = Buffer.from(text, 'utf8');
  const encrypted = publicEncrypt(
    {
      key: formattedPublicKey,
      padding: constants.RSA_PKCS1_PADDING, // Changed from OAEP to PKCS1
    },
    buffer,
  );

  // Return the encrypted value without headers
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
    const formattedPublicKey = publicKey ? formatKey(publicKey, 'public') : '';
    storedValue = encryptWithPublicKey(value, formattedPublicKey);
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
    throw error;
  }
  return data;
}

export async function updateTFVar(
  envVar: Table<'env_vars'>,
  isSecret: boolean,
  projectId: string,
  organizationId: string,
): Promise<SAPayload<Table<'env_vars'>>> {
  let storedValue;
  if (isSecret) {
    const publicKey = await getOrganizationPublicKey(organizationId);
    if (!publicKey) {
      throw new Error('Cannot encrypt secret - no public key');
    }
    const formattedPublicKey = publicKey ? formatKey(publicKey, 'public') : '';
    storedValue = encryptWithPublicKey(envVar.value, formattedPublicKey);
  } else {
    storedValue = envVar.value;
  }
  const { data: updatedEnvVar, error } = await supabaseAdminClient
    .from('env_vars')
    .update({
      name: envVar.name,
      value: storedValue,
      is_secret: isSecret,
      updated_at: new Date().toISOString(),
    })
    .eq('id', envVar.id)
    .eq('project_id', projectId)
    .select();

  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }

  revalidatePath(`/project/${projectId}`);
  return {
    status: 'success',
    data: updatedEnvVar[0],
  };
}

export async function addTFVar(
  name: string,
  value: string,
  isSecret: boolean,
  projectId: string,
  organizationId: string,
): Promise<SAPayload<Table<'env_vars'>>> {
  let storedValue;
  if (isSecret) {
    const publicKey = await getOrganizationPublicKey(organizationId);
    if (!publicKey) {
      throw new Error('Cannot encrypt secret - no public key');
    }
    const formattedPublicKey = publicKey ? formatKey(publicKey, 'public') : '';
    storedValue = encryptWithPublicKey(value, formattedPublicKey);
  } else {
    storedValue = value;
  }
  const { data: updatedEnvVar, error } = await supabaseAdminClient
    .from('env_vars')
    .insert({
      name,
      value: storedValue,
      is_secret: isSecret,
      updated_at: new Date().toISOString(),
      project_id: projectId,
    })
    .select();

  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }

  revalidatePath(`/project/${projectId}`);
  return {
    status: 'success',
    data: updatedEnvVar[0],
  };
}

export async function deleteTFVar(
  projectId: string,
  id: string,
): Promise<SAPayload> {
  const { error } = await supabaseAdminClient
    .from('env_vars')
    .delete()
    .eq('project_id', projectId)
    .eq('id', id);

  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }

  revalidatePath(`/project/${projectId}`);

  return {
    status: 'success',
  };
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
    return { value: data.value, isSecret: true };
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

export async function getAllEnvVars(
  projectId: string,
): Promise<Table<'env_vars'>[]> {
  const { data, error } = await supabaseAdminClient
    .from('env_vars')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;

  // convert bytea to string
  return Promise.all(
    data.map(async (item) => {
      return {
        ...item,
        value: item.is_secret ? '********' : item.value,
      };
    }),
  );
}

export async function decryptSecretWithPrivateKey(
  encryptedText: string,
  privateKey: string,
): Promise<SAPayload<{ decrypted: string }>> {
  const formattedPrivateKey = privateKey
    ? formatKey(privateKey, 'private')
    : '';
  const buffer = Buffer.from(encryptedText, 'base64');
  const decrypted = privateDecrypt(
    {
      key: formattedPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );
  return {
    status: 'success',
    data: {
      decrypted: decrypted.toString('utf8'),
    },
  };
}

export async function bulkUpdateTFVars(
  bulkEditValue: string,
  projectId: string,
  orgId: string,
): Promise<SAPayload<EnvVar[]>> {
  try {
    const parsedVars = JSON.parse(bulkEditValue);
    if (!Array.isArray(parsedVars)) {
      throw new Error('Invalid JSON format. Expected an array of variables.');
    }

    const names = parsedVars.map((v: { name: string; value: string }) =>
      v.name.toLowerCase(),
    );
    if (new Set(names).size !== names.length) {
      throw new Error('Duplicate variable names are not allowed');
    }

    const response = await tfvarsOnBulkUpdate(parsedVars, projectId, orgId);

    if (response.status === 'error') {
      throw new Error(response.message);
    }

    revalidatePath(`/project/${projectId}`);

    return {
      status: 'success',
      data: response.data,
    };
  } catch (error) {
    return {
      status: 'error',
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
