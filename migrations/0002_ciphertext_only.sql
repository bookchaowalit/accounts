-- Addresses arrive encrypted from the web backend. Refuse anything that still looks like a plaintext
-- address, so a client that skipped encryption fails loudly instead of storing an email in clear.
ALTER TABLE accounts.mailboxes
    ADD CONSTRAINT mailboxes_address_ciphertext_opaque CHECK (position('@' IN address_ciphertext) = 0),
    ADD CONSTRAINT mailboxes_address_hash_opaque CHECK (position('@' IN address_hash) = 0);
