# Supabase setup notes

This folder contains SQL to run in the Supabase Dashboard > SQL Editor.

1. Run `schema.sql` to create the messages table and allow public insert-only submissions. No one can read messages yet.
2. In Authentication settings, disable public sign-ups. Create the owner account yourself in Authentication > Users.
3. Copy that owner's User ID. Replace `PASTE-OWNER-USER-UUID-HERE` in `owner-read-policy.sql`, then run that SQL. It gives that one account read-only access.
4. Copy the Project URL and the publishable key (or legacy anon key) from Project Settings > API into `supabase-client.js`.

Never use a service_role/secret key in the website. Do not commit passwords or database credentials. The owner UUID in the SQL policy is an identifier, not a credential.
