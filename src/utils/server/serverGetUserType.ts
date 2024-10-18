'use server';
import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { userRoles } from '@/utils/userTypes';

// make sure to return one of UserRoles

//TODO reintroduce cache; used to be cache from react
// removed because it was failing: "(0 , react__WEBPACK_IMPORTED_MODULE_2__.cache) is not a function"
export const serverGetUserType = async () => {
  const supabase = createSupabaseUserServerComponentClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user) {
    return userRoles.ANON;
  }

  if (
    'user_role' in session.user &&
    session.user.user_role == userRoles.ADMIN
  ) {
    return userRoles.ADMIN;
  }

  return userRoles.USER;
};
