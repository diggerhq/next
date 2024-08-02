'use server';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getDefaultOrganization } from '@/data/user/organizations';
import { Check } from 'lucide-react';
import { SetDefaultOrganizationButton } from './SetDefaultOrganizationButton';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full  max-w-4xl ">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center space-x-2">
          Default Organization
        </CardTitle>
        <CardDescription>
          Choose the organization you'll see first when logging in.
        </CardDescription>
      </CardHeader>
      <CardFooter className='justify-start'>
        {children}
      </CardFooter>
    </Card>
  );
}

export async function SetDefaultOrganizationPreference({
  organizationId,
}: {
  organizationId: string;
}) {
  const defaultOrganizationId = await getDefaultOrganization();

  const isDefaultOrganization = defaultOrganizationId === organizationId;
  if (isDefaultOrganization) {
    return (
      <Wrapper>
        <Button className="w-fit justify-center space-x-2 pointer-events-none select-none bg-primary/10 text-primary hover:bg-primary/20" variant="secondary">
          <Check className="w-5 h-5 mr-2" />
          <span>This is your default organization</span>
        </Button>
      </Wrapper>
    );
  } else {
    return (
      <Wrapper>
        <SetDefaultOrganizationButton organizationId={organizationId} />
      </Wrapper>
    );
  }
}