import { supabaseAdminClient } from '../admin/supabaseAdminClient';

// this used to be a user-scoped client
// switching to admin because we no longer use supabase auth
// it's only used on the server so security ok
export const createSupabaseUserServerActionClient = () => supabaseAdminClient;
