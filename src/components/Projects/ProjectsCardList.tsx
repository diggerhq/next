"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { projects } from "@prisma/client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

export enum ProjectStatus {
  draft = "draft",
  pending_approval = "in review",
  approved = "in progress",
  completed = "completed",
}

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

type ProjectCardsProps = {
  projects: (projects & { teamName?: string })[];
}

export const ProjectsCardList = ({
  projects,
}: ProjectCardsProps) => {
  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center space-y-4 p-8 bg-muted rounded-lg"
      >
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold text-center"
        >
          No projects found
        </motion.h3>
      </motion.div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex space-x-4 pb-4">
        {projects.map((project, index) => (
          <MotionCard
            key={project.id}
            className="w-[300px] shadow-sm hover:bg-muted/50"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/project/${project.slug}`} className="block p-4">
              <MotionCardContent className="p-0 space-y-3" variants={contentVariants} initial="hidden" animate="visible">
                <motion.div className="flex justify-between items-center" variants={itemVariants}>
                  <span className="text-xs text-muted-foreground">ID: {project.id.slice(0, 7)}</span>
                  <Badge variant="outline" className="bg-primary/10 text-foreground">{project.teamName ? project.teamName : 'Org level'}</Badge>
                </motion.div>
                <motion.h2 className="text-lg font-semibold" variants={itemVariants}>{project.name}</motion.h2>
                <motion.div className="flex items-center text-xs text-muted-foreground" variants={itemVariants}>
                  <CalendarDays className="mr-1 h-3 w-3" />
                  <span>Created: {format(new Date(project.created_at), "dd MMM yyyy")}</span>
                </motion.div>
                <motion.div className="flex items-center text-xs text-muted-foreground" variants={itemVariants}>
                  <Clock className="mr-1 h-3 w-3" />
                  <span>Updated: {format(new Date(project.updated_at), "dd MMM yyyy")}</span>
                </motion.div>
                <motion.div className="text-xs text-muted-foreground flex items-center" variants={itemVariants}>
                  <LinkIcon className="mr-1 h-3 w-3" />
                  <span className="truncate">/{project.slug}</span>
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