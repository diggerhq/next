"use client"

import dynamic from 'next/dynamic';

const OrganizationExportPDF = dynamic(() => import('./OrganizationExportPDF').then(m => m.OrganizationExportPDF));

export function ExportPDF() {
  return <OrganizationExportPDF />;
}
