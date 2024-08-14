// types/driftTypes.ts

export type DriftAlert = {
  id: string;
  project_id: string;
  job_id: string;
  timestamp: string;
  is_resolved: boolean;
};

export const dummyDriftAlerts: DriftAlert[] = [
  {
    id: '3f9d6b8e-1a2c-4d5f-8g7h-9i0j1k2l3m4n',
    project_id: '4975d1d2-ed06-4a61-8412-75e47ddb0f67',
    job_id: 'b2c4e6f8-a0d2-4e6f-8g0h-2i4j6k8l0m2n',
    timestamp: '2023-08-15T10:30:00Z',
    is_resolved: false,
  },
  {
    id: '5a7c9e1b-3d5f-7g9h-1i3j-5k7m9n1p3r5t',
    project_id: '99ec54f6-ad32-40b4-ae3e-d9791744af84',
    job_id: '1f3feef7-cede-4216-a198-caa6ab64453a',
    timestamp: '2023-08-16T14:45:00Z',
    is_resolved: false,
  },
  {
    id: '7b9d1f3h-5j7l-9n1p-3r5t-7v9x1z3b5d7f',
    project_id: 'd79aa18c-2c7b-4fff-a478-9a71761239e7',
    job_id: 'f14b9283-960e-4e27-9cd3-b6763951a209',
    timestamp: '2023-08-17T09:15:00Z',
    is_resolved: false,
  },
  {
    id: '9c1e3g5i-7k9m-1o3q-5s7u-9w1y3a5c7e9g',
    project_id: '4975d1d2-ed06-4a61-8412-75e47ddb0f67',
    job_id: 'ec746345-fac9-47e1-901e-6524426f0757',
    timestamp: '2023-08-18T16:00:00Z',
    is_resolved: false,
  },
];

// types/runTypes.ts
export interface DiggerRun {
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  triggertype: string;
  pr_number: number | null;
  status: string;
  commit_id: string;
  digger_config: string | null;
  github_installation_id: number | null;
  repo_id: number;
  run_type: string;
  plan_stage_id: string | null;
  apply_stage_id: string | null;
  project_name: string | null;
  is_approved: boolean | null;
  approval_author: string | null;
  approval_date: string | null;
  project_id: string;
  terraform_output: string | null;
  apply_logs: string | null;
  approver_user_id: string | null;
}

export const dummyRuns: DiggerRun[] = [
  {
    created_at: '2023-08-15T10:30:00Z',
    updated_at: '2023-08-15T10:35:00Z',
    deleted_at: null,
    triggertype: 'manual',
    pr_number: 123,
    status: 'Pending Approval',
    commit_id: 'abc123def456',
    digger_config: null,
    github_installation_id: 987654,
    repo_id: 1,
    run_type: 'plan',
    plan_stage_id: null,
    apply_stage_id: null,
    project_name: 'Project Alpha',
    is_approved: null,
    approval_author: null,
    approval_date: null,
    project_id: '4975d1d2-ed06-4a61-8412-75e47ddb0f67',
    terraform_output: null,
    apply_logs: null,
    approver_user_id: null,
  },
  {
    created_at: '2023-08-16T14:45:00Z',
    updated_at: '2023-08-16T14:50:00Z',
    deleted_at: null,
    triggertype: 'auto',
    pr_number: null,
    status: 'Succeeded',
    commit_id: 'def456ghi789',
    digger_config: null,
    github_installation_id: 123456,
    repo_id: 1,
    run_type: 'apply',
    plan_stage_id: null,
    apply_stage_id: null,
    project_name: 'Project Beta',
    is_approved: true,
    approval_author: '0d7a7eae-7a71-4107-88a3-1334ad8423b9',
    approval_date: '2023-08-16T14:48:00Z',
    project_id: '99ec54f6-ad32-40b4-ae3e-d9791744af84',
    terraform_output:
      'Apply complete! Resources: 2 added, 1 changed, 0 destroyed.',
    apply_logs:
      'Applying changes...\nResource creation successful\nResource update successful',
    approver_user_id: '0d7a7eae-7a71-4107-88a3-1334ad8423b9',
  },
  {
    created_at: '2023-08-17T09:15:00Z',
    updated_at: '2023-08-17T09:20:00Z',
    deleted_at: null,
    triggertype: 'manual',
    pr_number: 456,
    status: 'Failed',
    commit_id: 'ghi789jkl012',
    digger_config: null,
    github_installation_id: 345678,
    repo_id: 1,
    run_type: 'plan',
    plan_stage_id: null,
    apply_stage_id: null,
    project_name: 'Project Gamma',
    is_approved: null,
    approval_author: null,
    approval_date: null,
    project_id: 'd79aa18c-2c7b-4fff-a478-9a71761239e7',
    terraform_output: 'Error: Invalid resource configuration',
    apply_logs: null,
    approver_user_id: null,
  },
  {
    created_at: '2023-08-18T16:00:00Z',
    updated_at: '2023-08-18T16:05:00Z',
    deleted_at: null,
    triggertype: 'auto',
    pr_number: null,
    status: 'Running Apply',
    commit_id: 'jkl012mno345',
    digger_config: null,
    github_installation_id: 567890,
    repo_id: 1,
    run_type: 'apply',
    plan_stage_id: null,
    apply_stage_id: null,
    project_name: 'Project Delta',
    is_approved: true,
    approval_author: '0d7a7eae-7a71-4107-88a3-1334ad8423b9',
    approval_date: '2023-08-18T15:58:00Z',
    project_id: '4975d1d2-ed06-4a61-8412-75e47ddb0f67',
    terraform_output: null,
    apply_logs: 'Applying changes...',
    approver_user_id: '0d7a7eae-7a71-4107-88a3-1334ad8423b9',
  },
];
