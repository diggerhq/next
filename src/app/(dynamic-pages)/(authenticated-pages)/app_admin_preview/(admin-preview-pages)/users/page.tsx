import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';
import { Search } from '@/components/Search';
import { AppAdminCreateUserDialogPreview } from '../../../app_admin/(admin-pages)/users/AppAdminCreateUserDialogPreview';
import { UsersListPreview } from '../../../app_admin/(admin-pages)/users/UsersListPreview';

export default function UsersPage() {
  return (
    <div className="space-y-4 max-w-[1296px]">
      <PageHeading
        title="Users"
        subTitle="View all users in your app. Perform actions such as creating new users, sending users login links, debug bugs your users face by logging in as them and more!"
      ></PageHeading>
      <div className="flex space-x-3  justify-between">
        <Search placeholder="Search Users... " />
        <AppAdminCreateUserDialogPreview />
      </div>
      <UsersListPreview />
      <Pagination totalPages={20} />
    </div>
  );
}
