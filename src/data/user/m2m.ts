'use server';
import { PrismaClient } from '@prisma/client';

export async function getM2MApplication(clientId: string) {
  const prisma = new PrismaClient();

  try {
    const m2mApp = await prisma.user_m2m_applications.findFirst({
      where: { clientId: clientId || '' },
    });

    if (!m2mApp) {
      console.log('No matching M2M application found for client ID:', clientId);
      throw new Error('m2m2 application not found');
    }

    return m2mApp;
  } finally {
    await prisma.$disconnect();
  }
}
