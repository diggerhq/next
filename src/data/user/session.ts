'use server';

import { SAPayload } from '@/types';

export async function refreshSessionAction(): Promise<SAPayload> {
  /*
  const supabaseClient = createSupabaseUserServerActionClient();
  const refreshSessionResponse = await supabaseClient.auth.refreshSession();

  if (refreshSessionResponse.error) {
    return {
      status: 'error',
      message: refreshSessionResponse.error.message,
    };
  }
    */

  //TODO re-implement with Auth.js or remove

  return {
    status: 'success',
  };
}
