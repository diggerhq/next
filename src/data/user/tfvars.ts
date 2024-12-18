// tfvars.ts
'use server';

import { SAPayload } from '@/types';
import { EnvVar } from '@/types/userTypes';
import { deleteEnvVar, getAllEnvVars, storeEnvVar } from '../admin/env-vars';

export async function tfvarsOnUpdate(
  oldName: string,
  newName: string,
  value: string,
  isSecret: boolean,
  projectId: string,
  orgId: string,
): Promise<EnvVar[]> {
  if (oldName !== newName) {
    await deleteEnvVar(projectId, oldName);
  }
  await storeEnvVar(projectId, orgId, newName, value, isSecret);
  const vars = await getAllEnvVars(projectId);
  return vars.map((v) => ({ ...v, updated_at: new Date().toISOString() }));
}

export async function tfvarsOnDelete(
  name: string,
  projectId: string,
): Promise<EnvVar[]> {
  await deleteEnvVar(projectId, name);
  const vars = await getAllEnvVars(projectId);
  return vars.map((v) => ({ ...v, updated_at: new Date().toISOString() }));
}

export async function tfvarsOnBulkUpdate(
  vars: EnvVar[],
  projectId: string,
  orgId: string,
): Promise<SAPayload<EnvVar[]>> {
  const currentVars = await getAllEnvVars(projectId);
  const currentVarsMap = Object.fromEntries(
    currentVars.map((v) => [v.name, v]),
  );

  for (const newVar of vars) {
    const currentVar = currentVarsMap[newVar.name];
    if (currentVar) {
      if (
        !currentVar.is_secret &&
        (currentVar.value !== newVar.value || currentVar.name !== newVar.name)
      ) {
        await tfvarsOnUpdate(
          currentVar.name,
          newVar.name,
          newVar.value,
          currentVar.is_secret,
          projectId,
          orgId,
        );
      }
    } else {
      await tfvarsOnUpdate(
        newVar.name,
        newVar.name,
        newVar.value,
        false,
        projectId,
        orgId,
      );
    }
  }

  for (const currentVar of currentVars) {
    if (
      !vars.some((v) => v.name === currentVar.name) &&
      !currentVar.is_secret
    ) {
      await tfvarsOnDelete(currentVar.name, projectId);
    }
  }

  const updatedVars = await getAllEnvVars(projectId);
  return {
    status: 'success',
    data: updatedVars.map((v) => ({
      ...v,
      updated_at: new Date().toISOString(),
    })),
  };
}
