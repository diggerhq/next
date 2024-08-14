// types/driftTypes.ts
// clearly dummy data is being generated here as no drift_alerts table is there yet

import { randomUUID } from 'crypto';

export type DriftAlert = {
  id: string;
  project_id: string;
  job_id: string;
  timestamp: string;
  is_resolved: boolean;
};

export const generateDummyDriftAlerts = (projectIds: string[]) => {
  const alerts: DriftAlert[] = [];
  const numAlerts = 10; // You can adjust this number as needed

  for (let i = 0; i < numAlerts; i++) {
    const alert: DriftAlert = {
      id: randomUUID(),
      project_id: projectIds[Math.floor(Math.random() * projectIds.length)],
      job_id: randomUUID(),
      timestamp: new Date().toISOString(),
      is_resolved: Math.random() < 0.5, // 50% chance of being resolved
    };
    alerts.push(alert);
  }

  return alerts;
};
