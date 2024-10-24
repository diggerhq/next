'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

//TODO reintroduce cache; used to be cache from react
// removed because it was failing: "(0 , react__WEBPACK_IMPORTED_MODULE_2__.cache) is not a function"
export const getSession = async () => {
  //const supabase = createSupabaseUserServerComponentClient();
  //return await supabase.auth.getSession();
  const session = await auth();
  return session;
};

//TODO reintroduce cache; used to be cache from react
// removed because it was failing: "(0 , react__WEBPACK_IMPORTED_MODULE_2__.cache) is not a function"
export const verifySession = async () => {
  /*
  const {
    user: { session },
    error: sessionError,
  } = await getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user) {
    redirect('/login');
  }

  return session.user;
  */
  const session = await auth();
  if (!session?.user) {
    redirect('/api/auth/signin');
  }
  return session?.user as AuthUser;
};
