'use client';
import { T } from '@/components/ui/Typography';
import { supabaseUserClientComponentClient } from '@/supabase-clients/user/supabaseUserClientComponentClient';
import { useRouter } from 'next/navigation';
import { useDidMount } from 'rooks';

export default function Logout() {
  const router = useRouter();
  useDidMount(async () => {
    await supabaseUserClientComponentClient.auth.signOut();
    router.refresh();
    router.replace('/login');
  });

  return <T.P>Signing out...</T.P>;
}
