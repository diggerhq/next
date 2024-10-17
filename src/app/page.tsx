
'use client'

import { supabaseAnonClient } from '@/supabase-clients/anon/supabaseAnonClient';
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Login } from './(dynamic-pages)/(login-pages)/login/Login';


export default function Default() {
    const supabase = supabaseAnonClient;

    // console.log(window.location.hash);

    // const hash = window.location.hash
    // // Remove the '#' character if present
    // const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;

    // // You can now use the hash value as needed
    // if (cleanHash) {
    //     console.log({ message: `Hash found: ${cleanHash}` });
    // } else {
    //     console.log({ message: 'No hash found in the URL' });
    // }

    const [authState, setAuthState] = useState<AuthChangeEvent | "">("");
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, sessionValue) => {
            console.log('state change', event, sessionValue)
            if (event === "INITIAL_SESSION") {

                setSession(sessionValue);
                console.log("got initial session value")
                window.location.href = `/auth/callback-tokens?access_token=${sessionValue?.access_token}&refresh_token=${sessionValue?.refresh_token}`
            } else {
                setAuthState(event);
            }
        });
    }, []);

    return (
        <>
            <h1>SSO Login Demo</h1>
            <p>Auth state: {JSON.stringify(authState)}</p>
            <h2>Session</h2>
            <pre>{JSON.stringify(session, null, 2)}</pre>
            {authState === "SIGNED_IN" ? (
                <p>
                    you are signed in
                </p>
            ) : (
                <Login></Login>
            )}
        </>
    );
}
