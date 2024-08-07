import { getUserProfile } from '@/data/user/user';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { AccountSettings } from './AccountSettings';

export default async function AccountSettingsPage() {
  const user = await serverGetLoggedInUser();
  const userProfile = await getUserProfile(user.id);


  return (
    <div className='flex flex-col space-y-4 max-w-5xl mt-2'>
      <AccountSettings userProfile={userProfile} userEmail={user.email} />
    </div>
  );
}
