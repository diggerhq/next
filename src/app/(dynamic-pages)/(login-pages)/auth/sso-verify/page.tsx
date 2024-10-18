
'use client'

import { supabaseAnonClient } from '@/supabase-clients/anon/supabaseAnonClient';
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";


export default function Default() {
    const supabase = supabaseAnonClient;

    const [authState, setAuthState] = useState<AuthChangeEvent | "">("");
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, sessionValue) => {
            console.log('state change', event, sessionValue)
            if (event === "INITIAL_SESSION") {
                window.location.href = `/auth/callback-tokens?access_token=${sessionValue?.access_token}&refresh_token=${sessionValue?.refresh_token}`
            } else {
                setAuthState(event);
            }
        });
    }, []);

    return (
        <>
            <p>Verifying login ...</p>
        </>
    );
}
