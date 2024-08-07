import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { UpdatePassword } from './UpdatePassword';

export default async function SecuritySettings() {
  const user = await serverGetLoggedInUser();
  return (
    <div className="space-y-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>
            Security Settings
          </CardTitle>
          <CardDescription>
            Update your email and password
          </CardDescription>
        </CardHeader>

        <UpdatePassword />

      </Card>
    </div>
  );
}
