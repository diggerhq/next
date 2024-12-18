"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";

import { AcceptInvitations } from "./AcceptInvitations";
import { OrganizationCreation } from "./OrganizationCreation";
import { ProfileUpdate } from "./ProfileUpdate";
import { TermsAcceptance } from "./TermsAcceptance";

import type { AuthUserMetadata } from "@/utils/zod-schemas/authUserMetadata";
import { user_profiles } from "@prisma/client";

type FLOW_STATE = "TERMS" | "PROFILE" | "ORGANIZATION" | "JOIN_INVITED_ORG" | "COMPLETE";

type UserOnboardingFlowProps = {
  userProfile: user_profiles;
  onboardingStatus: AuthUserMetadata;
  userEmail: string | undefined;
};

const MotionCard = motion(Card);

export function UserOnboardingFlow({
  userProfile,
  onboardingStatus,
  userEmail,
}: UserOnboardingFlowProps) {
  const flowStates = useMemo(() => getAllFlowStates(onboardingStatus), [onboardingStatus]);
  const [currentStep, setCurrentStep] = useState<FLOW_STATE>(
    getInitialFlowState(flowStates, onboardingStatus)
  );

  const router = useRouter();

  const nextStep = useCallback(() => {
    const currentIndex = flowStates.indexOf(currentStep);
    if (currentIndex < flowStates.length - 1) {
      setCurrentStep(flowStates[currentIndex + 1]);
    }
  }, [currentStep, flowStates]);
  console.log('flowStates : ', flowStates);

  useEffect(() => {
    if (currentStep === "COMPLETE") {
      console.log('currentStep is COMPLETE', currentStep);
      console.log('onboardingStatus : ', onboardingStatus);
      console.log('now redirecting to /dashboard');
      router.push("/dashboard");
    }
  }, [currentStep, router, onboardingStatus]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  console.log('currentStep in OnboardingFlow : ', currentStep)

  return (
    <AnimatePresence mode="wait">
      <MotionCard
        key={currentStep}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {currentStep === "TERMS" && <TermsAcceptance onSuccess={nextStep} />}
        {currentStep === "PROFILE" && (
          <ProfileUpdate
            userEmail={userEmail}
            userProfile={userProfile}
            onSuccess={nextStep}
          />
        )}
        {currentStep === "ORGANIZATION" && (
          <OrganizationCreation onSuccess={nextStep} />
        )}
        {currentStep === "JOIN_INVITED_ORG" && (
          <AcceptInvitations onSuccess={nextStep} />
        )}
      </MotionCard>
    </AnimatePresence>
  );
}

function getAllFlowStates(onboardingStatus: AuthUserMetadata): FLOW_STATE[] {
  const {
    onboardingHasAcceptedTerms,
    onboardingHasCompletedProfile,
    onboardingHasCreatedOrganization,
    isUserCreatedThroughOrgInvitation
  } = onboardingStatus;
  const flowStates: FLOW_STATE[] = [];

  // disabling terms step
  /*
  if (!onboardingHasAcceptedTerms) {
    flowStates.push("TERMS");
  }
  */
  if (!onboardingHasCompletedProfile) {
    flowStates.push("PROFILE");
  }
  if (!onboardingHasCreatedOrganization) {
    if (isUserCreatedThroughOrgInvitation) {
      flowStates.push("JOIN_INVITED_ORG");
    } else {
      if (process.env.NEXT_PUBLIC_SKIP_ORG_CREATION !== "true") {
        flowStates.push("ORGANIZATION");
      }

    }
  }

  flowStates.push("COMPLETE");

  return flowStates;
}

function getInitialFlowState(
  flowStates: FLOW_STATE[],
  onboardingStatus: AuthUserMetadata
): FLOW_STATE {
  const {
    onboardingHasAcceptedTerms,
    onboardingHasCompletedProfile,
    onboardingHasCreatedOrganization,
  } = onboardingStatus;

  // disabling terms step
  /*
  if (!onboardingHasAcceptedTerms && flowStates.includes("TERMS")) {
    return "TERMS";
  }
  */

  if (!onboardingHasCompletedProfile && flowStates.includes("PROFILE")) {
    return "PROFILE";
  }

  if (!onboardingHasCreatedOrganization) {
    if (flowStates.includes("JOIN_INVITED_ORG")) {
      return "JOIN_INVITED_ORG";
    } else if (flowStates.includes("ORGANIZATION")) {
      return "ORGANIZATION";
    }
  }



  return "COMPLETE";
}
