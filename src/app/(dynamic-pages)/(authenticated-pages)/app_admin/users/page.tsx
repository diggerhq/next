import {
  createUserAction,
  getUserImpersonationUrlAction,
  sendLoginLinkAction,
} from './actions';
import { RenderUsers } from './RenderUsers';
import { getUsersPaginatedAction } from './actions';

export const runtime = 'nodejs';
export const metadata = {
  title: 'User List | Admin Panel | Nextbase',
};

export default async function AdminPanel() {
  const data = await getUsersPaginatedAction({
    pageNumber: 0,
    search: undefined,
  });
  return (
    <div>
      <RenderUsers
        getUserImpersonationUrlAction={getUserImpersonationUrlAction}
        createUserAction={createUserAction}
        getUsersPaginatedAction={getUsersPaginatedAction}
        sendLoginLinkAction={sendLoginLinkAction}
        userData={data}
      />
    </div>
  );
}