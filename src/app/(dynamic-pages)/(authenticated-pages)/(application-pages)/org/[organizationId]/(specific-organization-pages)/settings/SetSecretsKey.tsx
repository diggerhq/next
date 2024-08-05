'use server';

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
                if (result.status === 'error') {
                    throw new Error(result.message);
                }
            }}
        />
    );
}