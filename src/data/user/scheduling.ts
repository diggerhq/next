import { SupabaseClient } from '@supabase/supabase-js';

export async function scheduleJob(
  supabase: SupabaseClient,
  jobName: string,
  schedule: string,
  command: string,
): Promise<void> {
  const { error } = await supabase.rpc('cron.schedule', {
    p_jobname: jobName,
    p_schedule: schedule,
    p_command: command,
  });

  if (error) {
    console.error('Error scheduling job:', error);
    throw error;
  }
  console.log(`Scheduled new job: ${jobName}`);
}

export async function alterJob(
  supabase: SupabaseClient,
  jobId: number,
  schedule: string,
  command: string,
): Promise<void> {
  const { error } = await supabase.rpc('cron.alter_job', {
    p_jobid: jobId,
    p_schedule: schedule,
    p_command: command,
  });

  if (error) {
    console.error('Error updating job:', error);
    throw error;
  }
  console.log(`Updated job: ${jobId}`);
}

export async function unscheduleJob(
  supabase: SupabaseClient,
  jobId: number,
): Promise<void> {
  const { error } = await supabase.rpc('cron.unschedule', {
    p_jobid: jobId,
  });

  if (error) {
    console.error('Error unscheduling job:', error);
    throw error;
  }
  console.log(`Unscheduled job: ${jobId}`);
}

export async function getExistingJob(
  supabase: SupabaseClient,
  jobName: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('cron.job')
    .select('jobid')
    .eq('jobname', jobName)
    .single();

  if (error) {
    console.error('Error fetching existing job:', error);
    throw error;
  }

  return data ? data.jobid : null;
}
