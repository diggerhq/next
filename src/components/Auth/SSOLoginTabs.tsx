'use client';
import { useConfig } from '@/app/AppProviders';
import { Button } from "@/components/ui/button";
import { supabaseAnonClient } from '@/supabase-clients/anon/supabaseAnonClient';
import { useRouter } from 'next/navigation';

export default function DefaultLoginTabs({
    next,
    nextActionType,
}: {
    next?: string;
    nextActionType?: string;
}) {

    const config = useConfig();
    const router = useRouter();

    async function ssoLogin() {
        const SSO_DOMAIN = config.SB_SSO_DOMAIN || ''
        const { data, error } = await supabaseAnonClient.auth.signInWithSSO({
            domain: SSO_DOMAIN,
        });
        if (error) {
            alert(error.message);
            return;
        }
        if (data?.url) {
            // redirect the user to the identity provider's authentication flow
            window.location.href = data.url;
            return;
        } else {
            alert("Unable to open SSO login page.");
        }
    }

    return (
        <div
            className="container data-[success]:flex items-center data-[success]:justify-center text-left max-w-lg mx-auto overflow-auto data-[success]:h-full min-h-[470px]"
        >

            <div className="space-y-8 bg-background p-6 rounded-lg shadow dark:border">
                <div className="md:min-w-[400px]">
                    <Button
                        onClick={ssoLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l4-4m0 0l-4-4m4 4H3m6 4v1a3 3 0 003 3h7a3 3 0 003-3V7a3 3 0 00-3-3h-7a3 3 0 00-3 3v1" />
                        </svg>
                        Login via SSO
                    </Button>
                </div>
            </div>

        </div>
    );
}