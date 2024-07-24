alter table "public"."encrypted_env_vars" drop column "iv";

alter table "public"."encrypted_env_vars" alter column "encrypted_value" set default ''::text;

alter table "public"."encrypted_env_vars" alter column "encrypted_value" set data type text using "encrypted_value"::text;


