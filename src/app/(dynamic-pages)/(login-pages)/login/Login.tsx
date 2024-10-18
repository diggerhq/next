'use client';
import { useConfig } from '@/app/AppProviders';
import DefaultLoginTabs from '@/components/Auth/DefaultLoginTabs';
import SSOLoginTabs from '@/components/Auth/SSOLoginTabs';

export function Login({
  next,
  nextActionType,
}: {
  next?: string;
  nextActionType?: string;
}) {
  const config = useConfig();

  return (
    <>
      {config.SB_SSO_DOMAIN ? <SSOLoginTabs></SSOLoginTabs> : <DefaultLoginTabs></DefaultLoginTabs>}
    </>
  );
}
