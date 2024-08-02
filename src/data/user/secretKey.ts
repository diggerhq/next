// data/user/secretsKey.ts
'use server';

import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { SAPayload } from '@/types';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function getPublicKey(
  organizationId: string,
): Promise<string | null> {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('public_key')
    .eq('id', organizationId)
    .single();

  if (error) {
    console.error('Error fetching public key:', error);
    return null;
  }

  return data?.public_key || null;
}

export async function createKeyPair(
  organizationId: string,
): Promise<SAPayload<{ publicKey: string; privateKey: string }>> {
  const supabase = createSupabaseUserServerActionClient();

  try {
    // Generate RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Save public key to the database
    const { error } = await supabase
      .from('organizations')
      .update({ public_key: publicKey })
      .eq('id', organizationId);

    if (error) throw error;

    revalidatePath(`/org/${organizationId}/settings`);

    return {
      status: 'success',
      data: { publicKey, privateKey },
    };
  } catch (error) {
    console.error('Error creating key pair:', error);
    return {
      status: 'error',
      message: 'Failed to create key pair',
    };
  }
}

export async function deletePublicKey(
  organizationId: string,
): Promise<SAPayload> {
  const supabase = createSupabaseUserServerActionClient();

  try {
    const { error } = await supabase
      .from('organizations')
      .update({ public_key: null })
      .eq('id', organizationId);

    if (error) throw error;

    revalidatePath(`/org/${organizationId}/settings`);

    return {
      status: 'success',
    };
  } catch (error) {
    console.error('Error deleting public key:', error);
    return {
      status: 'error',
      message: 'Failed to delete public key',
    };
  }
}
