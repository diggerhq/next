'use server';

import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';

export async function getRepoDetails(repoId: number) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('repos')
    .select('id, name')
    .eq('id', repoId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
