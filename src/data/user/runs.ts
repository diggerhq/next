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

export async function getAllRunsByOrganizationId(organizationId: string) {
  const supabase = createSupabaseUserServerComponentClient();

  const { data: runs, error } = await supabase
    .from('digger_runs')
    .select(
      `
      id,
      commit_id,
      status,
      updated_at,
      project_id,
      repo_id,  
      repos(repo_full_name),
      approver_user_id,
      projects(name, slug)
    `,
    )
    .eq('projects.organization_id', organizationId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Fetch user profiles for approvers
  const approverIds = runs.map((run) => run.approver_user_id).filter(Boolean);
  const { data: approvers, error: approversError } = await supabase
    .from('user_profiles')
    .select('id, user_name')
    .in('id', approverIds);

  if (approversError) throw approversError;

  // Create a map of approver ids to user names
  const approverMap = new Map(
    approvers.map((approver) => [approver.id, approver.user_name]),
  );

  return runs.map((run) => ({
    ...run,
    project_name: run.projects?.name ?? null,
    approver_user_name: run.approver_user_id
      ? (approverMap.get(run.approver_user_id) ?? null)
      : null,
  }));
}

export async function requestRunApproval(
  runId: string,
): Promise<SAPayload<string>> {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('digger_runs')
    .update({ status: 'Pending Approval' })
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
      status: 'Approved',
      approver_user_id: userId,
      is_approved: true,
      updated_at: new Date().toISOString(),
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
      status: 'Discarded',
      approver_user_id: userId,
      is_approved: false,
      updated_at: new Date().toISOString(),
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

export async function getBatchIdFromPlanStageId(planStageId: string | null) {
  if (!planStageId) return null;
  const supabase = createSupabaseUserServerComponentClient();
  const { error, data } = await supabase
    .from('digger_run_stages')
    .select('batch_id')
    .eq('id', planStageId)
    .single();

  if (error) throw error;

  return data.batch_id;
}

export async function getBatchIdFromApplyStageId(applyStageId: string | null) {
  if (!applyStageId) return null;
  const supabase = createSupabaseUserServerComponentClient();
  const { error, data } = await supabase
    .from('digger_run_stages')
    .select('batch_id')
    .eq('id', applyStageId)
    .single();

  if (error) throw error;

  return data.batch_id;
}

export async function getTFOutputAndWorkflowURLFromBatchId(
  batchId: string | null,
) {
  if (!batchId) return { terraform_output: null, workflow_run_url: null };

  const supabase = createSupabaseUserServerComponentClient();
  const { error, data } = await supabase
    .from('digger_jobs')
    .select('terraform_output, workflow_run_url')
    .eq('batch_id', batchId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return {
    terraform_output: data?.terraform_output ?? null,
    workflow_run_url: data?.workflow_run_url ?? null,
  };
}
export async function getOutputLogsAndWorkflowURLFromBatchId(
  batchId: string | null,
) {
  if (!batchId) return { terraform_output: null, workflow_run_url: null };

  const supabase = createSupabaseUserServerComponentClient();
  const { error, data } = await supabase
    .from('digger_jobs')
    .select('terraform_output, workflow_run_url')
    .eq('batch_id', batchId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return {
    terraform_output: data?.terraform_output ?? null,
    workflow_run_url: data?.workflow_run_url ?? null,
  };
}
