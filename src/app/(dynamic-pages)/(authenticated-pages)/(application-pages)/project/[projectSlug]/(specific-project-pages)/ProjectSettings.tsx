'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ProjectSettings() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
        >
            <Card className="w-full">
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: 0.1 }}
                >
                    <CardHeader>
                        <CardTitle>Project Settings</CardTitle>
                        <CardDescription>Manage settings for your project</CardDescription>
                    </CardHeader>
                </motion.div>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: 0.2 }}
                    >
                        {/* Add your project settings management component here */}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}