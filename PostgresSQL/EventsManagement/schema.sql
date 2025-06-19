-- Tabella utenti
CREATE TABLE partecipants (
    magic_events_tag SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Tabella admin (associati agli utenti)
CREATE TABLE admins (
    admin_id BIGINT PRIMARY KEY,
    magic_events_tag BIGINT,
    FOREIGN KEY (magic_events_tag) REFERENCES partecipants(magic_events_tag) ON DELETE CASCADE
);

-- Tabella eventi
CREATE TABLE event_info (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    starting TIMESTAMP NOT NULL,
    ending TIMESTAMP NOT NULL,
    location VARCHAR(255),
    magic_events_tag BIGINT,
    FOREIGN KEY (magic_events_tag) REFERENCES partecipants(magic_events_tag) ON DELETE CASCADE
);

-- Tabella di join eventi-user partecipants
CREATE TABLE event_participants (
    event_id BIGINT,
    magic_events_tag BIGINT,
    PRIMARY KEY (event_id, magic_events_tag),
    FOREIGN KEY (event_id) REFERENCES event_info(event_id) ON DELETE CASCADE,
    FOREIGN KEY (magic_events_tag) REFERENCES partecipants(magic_events_tag) ON DELETE CASCADE
);

-- Tabella di join eventi-admins
CREATE TABLE event_admins (
    event_id BIGINT,
    admin_id BIGINT,
    PRIMARY KEY (event_id, admin_id),
    FOREIGN KEY (event_id) REFERENCES event_info(event_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
);
