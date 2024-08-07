import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { T } from '@/components/ui/Typography';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { UpdatePassword } from './UpdatePassword';

export default async function SecuritySettings() {
  const user = await serverGetLoggedInUser();
  return (
    <div className="space-y-6 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>
            Security Settings
          </CardTitle>
          <CardDescription>
            Update your email and password
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-muted-foreground">
              Email
            </Label>
            <div className="flex flex-col gap-2 w-1/3 ">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={user.email}
                readOnly
                disabled
                className='mb-1'
              />
            </div>
            <T.Small className=" text-muted-foreground font-normal">
              Email cannot be changed
            </T.Small>
          </div>
          <UpdatePassword />
        </CardContent>
      </Card>
    </div>
  );
}
