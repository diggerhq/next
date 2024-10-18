'use client';
import DefaultLoginTabs from '@/components/Auth/DefaultLoginTabs';
import SSOLoginTabs from '@/components/Auth/SSOLoginTabs';

export function Login({
  next,
  nextActionType,
}: {
  next?: string;
  nextActionType?: string;
}) {
  return (
    <>
      {process.env.NEXT_PUBLIC_SSO_DOMAIN ? <SSOLoginTabs></SSOLoginTabs> : <DefaultLoginTabs></DefaultLoginTabs>}
    </>
  );
}
