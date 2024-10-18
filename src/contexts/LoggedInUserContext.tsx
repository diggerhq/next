'use client';
import { AuthUser } from '@/utils/server/verifySession';
import { createContext } from 'react';

type LoggedInUserContextType = {
  user: AuthUser;
};

export const LoggedInUserContext = createContext<LoggedInUserContextType>({
  user: null as unknown as AuthUser,
});

export const LoggedInUserProvider = ({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) => {
  return (
    <LoggedInUserContext.Provider value={{ user }}>
      {children}
    </LoggedInUserContext.Provider>
  );
};
