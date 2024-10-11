'use server';

import { AuthUser, getSession } from './verifySession';

//TODO reintroduce cache; used to be cache from react
// removed because it was failing: "(0 , react__WEBPACK_IMPORTED_MODULE_2__.cache) is not a function"
export const serverGetLoggedInUser = async () => {
  const session = await getSession();

  if (!session) {
    throw new Error('serverGetLoggedInUser: No session');
  }

  if (!session?.user) {
    throw new Error('serverGetLoggedInUser: Not logged in');
  }

  return session.user as AuthUser;
};
