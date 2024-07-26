'use server';

import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { SAPayload } from '@/types';

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

export async function getRunById(runId: string) {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('digger_runs')
    .select(
      `
      *,
      projects(name),
      repos(name)
    `,
    )
    .eq('id', runId)
    .single();

  if (error) throw error;
  return data;
}

export async function getRunsByRepoId(repoId: string) {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('digger_runs')
    .select(
      `
      id,
      commit_id,
      status,
      created_at,
      projects(name),
      repos(name)
    `,
    )
    .eq('repo_id', repoId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRunsByProjectId(projectId: string) {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('digger_runs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function requestRunApproval(
  runId: string,
): Promise<SAPayload<string>> {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('digger_runs')
    .update({ status: 'pending_approval' })
    .eq('id', runId)
    .select('id')
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }
  return { status: 'success', data: data.id };
}

export async function approveRun(
  runId: string,
  userId: string,
): Promise<SAPayload<string>> {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('digger_runs')
    .update({
      status: 'pending_apply',
      approver_user_id: userId,
      is_approved: true,
    })
    .eq('id', runId)
    .select('id')
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }
  return { status: 'success', data: data.id };
}

export async function rejectRun(
  runId: string,
  userId: string,
): Promise<SAPayload<string>> {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('digger_runs')
    .update({
      status: 'rejected',
      approver_user_id: userId,
      is_approved: false,
    })
    .eq('id', runId)
    .select('id')
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }
  return { status: 'success', data: data.id };
}

export async function changeRunStatus(runId: string, status: string) {
  const supabase = createSupabaseUserServerComponentClient();
  const { error } = await supabase
    .from('digger_runs')
    .update({ status: status })
    .eq('id', runId)
    .select('id')
    .single();

  if (error) throw error;
}
