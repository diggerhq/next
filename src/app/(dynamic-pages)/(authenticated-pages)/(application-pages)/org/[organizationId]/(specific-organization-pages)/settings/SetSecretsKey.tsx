'use server';

import { deleteAllEnvVars } from '@/data/admin/env-vars';
import { getProjectIdsOfOrganization } from '@/data/admin/organizations';
import { createKeyPair, deletePublicKey, getPublicKey } from '@/data/user/secretKey';
import { SecretsKeyManager } from './SecretKeyManager';

export async function SetSecretsKey({ organizationId }: { organizationId: string }) {
    const publicKey = await getPublicKey(organizationId);
    return (
        <SecretsKeyManager
            publicKey={publicKey}
            onCreateKeyPair={async () => {
                'use server';
                const result = await createKeyPair(organizationId);
                if (result.status === 'error') {
                    throw new Error(result.message);
                }
                return result.data;
            }}
            onDeletePublicKey={async () => {
                'use server';
                const result = await deletePublicKey(organizationId);
                const projectIds = await getProjectIdsOfOrganization(organizationId);
                for (const projectId of projectIds) {
                    await deleteAllEnvVars(projectId);
                }
                if (result.status === 'error') {
                    throw new Error(result.message);
                }
            }}
        />
    );
}