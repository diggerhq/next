import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { acceptTermsOfService } from "@/data/user/user";
import { useMutation } from "@tanstack/react-query";

type TermsAcceptanceProps = {
  onSuccess: () => void;
};

export function TermsAcceptance({ onSuccess }: TermsAcceptanceProps) {
  const { toast } = useToast();
  const acceptTermsMutation = useMutation({
    mutationFn: () => acceptTermsOfService(true),
    onSuccess: () => {
      toast({ title: "Terms accepted!", description: "Welcome aboard!" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to accept terms", description: "Please try again.", variant: "destructive" });
    },
  });

  return (
    <>
      <CardHeader>
        <CardTitle>🎉 Welcome Aboard!</CardTitle>
        <CardDescription>
          Before diving in, please review our updated Terms of Service.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          These terms govern the use of our products and services, ensuring a smooth and secure experience for you.
        </p>
        <p className="text-sm font-medium mt-2">
          Last updated: <time dateTime="2024-04-24">24th April 2024</time>
        </p>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">View Terms</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terms and Conditions</DialogTitle>
              <DialogDescription>
                Please read our terms and conditions carefully.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-auto p-4 space-y-4 bg-muted rounded-md">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
              <p>Ut tempor quam eget lectus consequat, id egestas nisi semper...</p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => acceptTermsMutation.mutate()}
                disabled={acceptTermsMutation.isLoading}
              >
                {acceptTermsMutation.isLoading ? "Accepting..." : "Accept Terms"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </>
  );
}
