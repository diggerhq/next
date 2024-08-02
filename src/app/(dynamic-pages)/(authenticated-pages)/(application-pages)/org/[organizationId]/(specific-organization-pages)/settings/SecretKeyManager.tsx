// SecretsKeyManager.tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SecretsKeyManagerProps {
    publicKey: string | null;
    onCreateKeyPair: () => Promise<{ publicKey: string; privateKey: string }>;
    onDeletePublicKey: () => Promise<void>;
}

export function SecretsKeyManager({ publicKey: initialPublicKey, onCreateKeyPair, onDeletePublicKey }: SecretsKeyManagerProps) {
    const [publicKey, setPublicKey] = useState<string | null>(initialPublicKey);
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateKeyPair = async () => {
        setIsCreating(true);
        try {
            const { publicKey: newPublicKey, privateKey: newPrivateKey } = await onCreateKeyPair();
            setPublicKey(newPublicKey);
            setPrivateKey(newPrivateKey);
        } catch (error) {
            console.error('Failed to create key pair:', error);
            toast.error('Failed to create key pair. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeletePublicKey = async () => {
        setIsDeleting(true);
        try {
            await onDeletePublicKey();
            setPublicKey(null);
            setPrivateKey(null);
            toast.success('Public key has been deleted.');
        } catch (error) {
            console.error('Failed to delete public key:', error);
            toast.error('Failed to delete public key. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('The key has been copied to your clipboard.');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <span>Secrets Key</span>
                    </CardTitle>
                    <CardDescription>
                        Public key for encrypting sensitive variables
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {publicKey ? (
                        <div className="space-y-4">
                            <div>
                                <Label>Public Key</Label>
                                <div className="flex items-center mt-1">
                                    <Input
                                        readOnly
                                        value={publicKey}
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="ml-2"
                                        onClick={() => copyToClipboard(publicKey)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            {privateKey && (
                                <Alert>
                                    <AlertTitle>Private Key (ONLY SHOWN ONCE)</AlertTitle>
                                    <AlertDescription>
                                        <p className="mb-2">Save this in your GitHub Action Secrets (org level):</p>
                                        <div className="flex items-center">
                                            <Input
                                                readOnly
                                                value={privateKey}
                                                className="font-mono text-sm"
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="ml-2"
                                                onClick={() => copyToClipboard(privateKey)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    ) : (
                        <Button onClick={handleCreateKeyPair} disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Secrets Key'}
                        </Button>
                    )}
                </CardContent>
                {publicKey && (
                    <CardFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Secrets Key
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. You will lose all your secrets without the possibility to recover them.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { }}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleDeletePublicKey} disabled={isDeleting}>
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    );
}