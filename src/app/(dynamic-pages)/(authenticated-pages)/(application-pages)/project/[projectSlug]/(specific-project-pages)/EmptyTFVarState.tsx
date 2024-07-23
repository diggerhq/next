import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
    onAddVariable: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddVariable }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="mt-6 border-none bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <h3 className="text-2xl font-semibold mb-2">No Environment Variables Yet</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Add your first environment variable to get started. These variables will be available in your project's runtime.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button onClick={onAddVariable} size="lg">
                            <Plus className="mr-2 h-4 w-4" /> Add Environment Variable
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default EmptyState;