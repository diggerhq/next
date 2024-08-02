'use server';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createKeyPair, deletePublicKey, getPublicKey } from '@/data/user/secretKey';
import { SecretsKeyManager } from './SecretKeyManager';

const publicKey: string = 'asdfasdf'; //TODO state, fetch
const privateKey: string = 'asdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaaasdfaa'; //TODO state

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <Card className="w-full  max-w-5xl ">
            <CardHeader className="space-y-1">
                <CardTitle className="flex items-center space-x-2">
                    Secrets Key
                </CardTitle>
                <CardDescription>
                    Public key for encrypting sensitive variables
                </CardDescription>
            </CardHeader>
            <CardFooter className='justify-start'>
                {children}
            </CardFooter>
        </Card>
    );
}

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