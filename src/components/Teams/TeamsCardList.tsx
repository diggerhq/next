"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table } from "@/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarDays, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

const MotionCard = motion(Card);
const MotionCardContent = motion(CardContent);

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const contentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export const TeamsCardList = ({
    teams,
}: {
    teams: Table<"teams">[];
}) => {
    if (teams.length === 0) {
        return (
            <p className="text-muted-foreground my-6">
                🔍 No matching teams found.
            </p>
        );
    }

    return (
        <ScrollArea className="w-full">
            <div className="flex space-x-4 pb-4">
                {teams.slice(0, 5).map((team, index) => (
                    <MotionCard
                        key={team.id}
                        className="w-[300px] shadow-sm"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Link href={`/org/${team.organization_id}/team/${team.id}`} className="block p-4">
                            <MotionCardContent className="p-0 space-y-3" variants={contentVariants} initial="hidden" animate="visible">
                                <motion.div className="flex justify-between items-center" variants={itemVariants}>
                                    <span className="text-xs text-muted-foreground">ID: {team.id}</span>
                                </motion.div>
                                <motion.h2 className="text-lg font-semibold" variants={itemVariants}>{team.name}</motion.h2>
                                <motion.div className="flex items-center text-xs text-muted-foreground" variants={itemVariants}>
                                    <CalendarDays className="mr-1 h-3 w-3" />
                                    <span>Created: {format(new Date(team.created_at ?? Date.now()), "dd MMM yyyy")}</span>
                                </motion.div>
                                <motion.div className="text-xs text-muted-foreground flex items-center" variants={itemVariants}>
                                    <LinkIcon className="mr-1 h-3 w-3" />
                                    <span className="truncate">/{team.id}</span>
                                </motion.div>
                            </MotionCardContent>
                        </Link>
                    </MotionCard>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
};

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}