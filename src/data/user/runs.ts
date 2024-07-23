'use server';

import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';

export async function getTFVarsByProjectId(projectId: string) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('project_tfvars')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found, return null instead of throwing an error
      return null;
    }
    throw error;
  }
  return data;
}

// In your projects.ts or a new file like tfvars.ts

export async function updateTFVarsByProjectId(
  projectId: string,
  tfvars: { tfvars: string },
) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('project_tfvars')
    .update(tfvars)
    .eq('project_id', projectId);

  if (error) throw error;
  return data;
}

export async function createTFVarsByProjectId(
  projectId: string,
  tfvars: { tfvars: string },
) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('project_tfvars')
    .insert({ project_id: projectId, ...tfvars })
    .single();

  if (error) throw error;
  return data;
}

export async function upsertTFVarsByProjectId(
  projectId: string,
  tfvars: { tfvars: string },
) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('project_tfvars')
    .upsert(
      {
        project_id: projectId,
        ...tfvars,
        updated_at: new Date().toISOString(), // Manually set updated_at
      },
      { onConflict: 'project_id', ignoreDuplicates: false },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
