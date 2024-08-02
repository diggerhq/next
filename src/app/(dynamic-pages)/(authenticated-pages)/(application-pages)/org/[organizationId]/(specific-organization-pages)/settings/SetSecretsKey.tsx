'use server';

import { Button } from '@/components/Button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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

export async function SetSecretsKey({ }: {}) {
    if (publicKey) {
        return (
            <Wrapper>
                {/* TODO copy icon, formatting */}
                {/* TODO delete button in Danger Zone */}
                <p>
                    <span><b>Public key:</b> {publicKey}</span>
                </p>

                {privateKey && (
                    <p>
                        <span><b>Private key (ONLY SHOWN ONCE - SAVE IN YOUR GITHUB ACTION SECRETS (ORG LEVEL)):</b><br /> {privateKey}</span>
                    </p>
                )}
            </Wrapper>
        );
    } else {
        return (
            <Wrapper>
                {/* TODO generate key pair, set private key state locally, send public key to the server */}
                <Button>Create secrets key</Button>
            </Wrapper>
        );
    }
}