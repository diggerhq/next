'use server';

import { getUserProfileByEmail } from '@/data/user/user';
import { AuthUser, getSession } from './verifySession';

//TODO reintroduce cache; used to be cache from react
// removed because it was failing: "(0 , react__WEBPACK_IMPORTED_MODULE_2__.cache) is not a function"
//TODO don't check DB here it will likely make it slow
export const serverGetLoggedInUser = async () => {
  const session = await getSession();

  if (!session) {
    throw new Error('serverGetLoggedInUser: No session');
  }

  if (!session?.user) {
    throw new Error('serverGetLoggedInUser: Not logged in');
  }
  try {
    //TODO this is a dirty workaround to avoid migrating from auth.user.id to email as id
    // user object from auth.js only has email, but no ID unlike Subabase's auth
    // but we have user_profiles table which used to be FK for auth.user.id
    // so using that id as a substitute for actual user id for auth
    // PS if the app feels slow this might be the reason why :) hope it's not too bad thx to cache
    const profile = await getUserProfileByEmail(session.user.email!);
    return {
      ...session.user,
      id: profile.id,
    } as AuthUser;
  } catch (e) {
    console.error(
      'serverGetLoggedInUser: Failed to get user profile by email',
      e,
    );
    throw e;
  }
};
