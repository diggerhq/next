import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getPendingInvitationsOfUser } from "@/data/user/invitation";
import { autoAcceptFirstInvitation } from "@/data/user/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

type AcceptInvitationsProps = {
  onSuccess: () => void;
};

function Spinner() {
  return <div className="w-4 h-4 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
}

export function AcceptInvitations({ onSuccess }: AcceptInvitationsProps) {
  const { toast } = useToast();

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ["pendingInvitations"],
    queryFn: getPendingInvitationsOfUser,
  });



  const acceptInvitationMutation = useMutation({
    mutationFn: autoAcceptFirstInvitation,
    onSuccess: () => {
      toast({ title: "Organization setup complete!", description: "You've joined the organization." });
      onSuccess();
    },
    onError: (error) => {
      const errorMessage = String(error);
      toast({ title: "Failed to accept invitation", description: errorMessage, variant: "destructive" });
    },
  });

  useEffect(() => {
    acceptInvitationMutation.mutate();
  }, []);



  if (isLoading) {
    return (
      <>
        <CardHeader>
          <CardTitle>Checking Invitations</CardTitle>
          <CardDescription>Please wait while we process your invitations.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Spinner />
        </CardContent>
      </>
    );
  }

  if (error) {
    const errorMessage = String(error);
    return (
      <>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>An error occurred while processing invitations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{errorMessage}</p>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Processing Invitations</CardTitle>
        <CardDescription>
          {invitations && invitations.length > 0
            ? "Accepting your invitations..."
            : "No pending invitations found."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Spinner />
      </CardContent>
    </>
  );
}
