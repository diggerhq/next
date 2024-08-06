'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { decryptWithPrivateKey, encryptWithPublicKey, formatKey } from "@/utils/crypto";
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function EncryptionTestComponent({
    organizationId,
    publicKey: publicKeyFromProps,
}: {
    organizationId: string;
    publicKey: string | null;
}) {


    const [envVar, setEnvVar] = useState('');
    const [encryptedVar, setEncryptedVar] = useState('');
    const [decryptedVar, setDecryptedVar] = useState('');
    const [isMatch, setIsMatch] = useState<boolean | null>(null);


    const [publicKey, setPublicKey] = useState<string | null>(publicKeyFromProps || null);
    const [privateKey, setPrivateKey] = useState('');

    const formattedPublicKey = publicKey ? formatKey(publicKey, 'public') : '';
    const formattedPrivateKey = privateKey ? formatKey(privateKey, 'private') : '';


    const handleEncrypt = async () => {
        try {
            if (!formattedPublicKey) {
                throw new Error('Public key is not available');
            }
            console.log('---------------------------------');
            console.log('formattedPublicKey', formattedPublicKey);

            const encrypted = encryptWithPublicKey(envVar, formattedPublicKey);
            console.log('encrypted', encrypted);
            setEncryptedVar(encrypted);
        } catch (error) {
            console.error('Encryption error:', error);
            setEncryptedVar('Encryption failed: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    const handleDecrypt = async () => {
        try {
            console.log('---------------------------------');
            console.log('formattedPrivateKey', formattedPrivateKey);
            const decrypted = decryptWithPrivateKey(encryptedVar, formattedPrivateKey);
            console.log('decrypted', decrypted);
            setDecryptedVar(decrypted);
            setIsMatch(decrypted === envVar);
        } catch (error) {
            console.error('Decryption error:', error);
            setDecryptedVar(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
            setIsMatch(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <pre>{JSON.stringify(publicKey, null, 2)}</pre>
            <pre>{JSON.stringify(privateKey, null, 2)}</pre>
            <Card>
                <CardHeader>
                    <CardTitle>Encryption/Decryption Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="envVar">Environment Variable</Label>
                        <Input
                            id="envVar"
                            value={envVar}
                            onChange={(e) => setEnvVar(e.target.value)}
                            placeholder="Enter environment variable"
                        />
                        <Button onClick={handleEncrypt} className="mt-2">Encrypt</Button>
                    </div>

                    <div>
                        <Label htmlFor="encryptedVar">Encrypted Variable</Label>
                        <Input
                            id="encryptedVar"
                            value={encryptedVar}
                            readOnly
                            placeholder="Encrypted value will appear here"
                        />
                    </div>

                    <div>
                        <Label htmlFor="privateKey">Private Key</Label>
                        <Textarea
                            id="privateKey"
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            placeholder="Enter private key"
                            className="w-full h-32 p-2 border rounded"
                        />
                        <Button onClick={handleDecrypt} className="mt-2">Decrypt</Button>
                    </div>

                    <div>
                        <Label htmlFor="decryptedVar">Decrypted Variable</Label>
                        <Input
                            id="decryptedVar"
                            value={decryptedVar}
                            readOnly
                            placeholder="Decrypted value will appear here"
                        />
                        {decryptedVar && <p>Decrypted: {decryptedVar}</p>}
                        {encryptedVar && <p>Encrypted: {encryptedVar}</p>}
                    </div>

                    {isMatch !== null && (
                        <div>
                            {isMatch
                                ? <p className="text-green-500">The decrypted value matches the original value!</p>
                                : <p className="text-red-500">The decrypted value does not match the original value.</p>
                            }
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}