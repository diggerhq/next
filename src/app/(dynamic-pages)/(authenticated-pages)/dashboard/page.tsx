'use client'

import { getInitialOrganizationToRedirectTo } from '@/data/user/organizations';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDidMount } from 'rooks';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const router = useRouter();

  const initialOrgRedirectMutation = useSAToastMutation(getInitialOrganizationToRedirectTo, {
    loadingMessage: 'Loading your dashboard...',
    errorMessage: 'Failed to load dashboard',
    successMessage: 'Redirecting to your dashboard...',
    onSuccess: (successPayload) => {
      router.push(`/org/${successPayload.data}`);
    },
    onError: (errorPayload) => {
      console.error(errorPayload);
    },
  });

  useDidMount(() => {
    initialOrgRedirectMutation.mutate();
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center justify-center h-screen"
    >
      {initialOrgRedirectMutation.isLoading && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold"
        >
          Loading your dashboard...
        </motion.div>
      )}
    </motion.div>
  );
}