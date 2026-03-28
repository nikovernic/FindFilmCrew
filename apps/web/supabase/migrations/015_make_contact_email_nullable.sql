-- Make contact_email nullable so profiles can be imported without an email
ALTER TABLE profiles ALTER COLUMN contact_email DROP NOT NULL;
