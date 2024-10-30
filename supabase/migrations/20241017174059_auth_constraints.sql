ALTER TABLE public.chats
DROP CONSTRAINT IF EXISTS chats_user_id_fkey;

ALTER TABLE public.user_private_info
DROP CONSTRAINT IF EXISTS user_private_info_id_fkey;

