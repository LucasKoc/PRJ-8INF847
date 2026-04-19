-- DPSCHECK seed data
-- All test users have password: Password123!
-- bcrypt hash (cost 10): $2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2

BEGIN;

-- ========== USERS ==========
INSERT INTO users (email, username, password_hash, role)
VALUES ('organizer@dpscheck.local', 'organizer_one', '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2',
        'TO'),
       ('alice@dpscheck.local', 'alice_mid', '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER'),
       ('bob@dpscheck.local', 'bob_top', '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER'),
       ('charlie@dpscheck.local', 'charlie_jg', '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2',
        'PLAYER'),
       ('diana@dpscheck.local', 'diana_adc', '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER'),
       ('eve@dpscheck.local', 'eve_sup', '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER');

-- ========== PLAYER PROFILES ==========
INSERT INTO player_profiles (user_id, summoner_name, tag_line, region, main_role, rank, bio)
VALUES ((SELECT id FROM users WHERE username = 'alice_mid'), 'AliceMid', 'EUW', 'EUW1', 'MID', 'Diamond II',
        'Midlane main, assassin enjoyer.'),
       ((SELECT id FROM users WHERE username = 'bob_top'), 'BobTheTank', 'EUW', 'EUW1', 'TOP', 'Platinum I',
        'Top main, tank specialist.'),
       ((SELECT id FROM users WHERE username = 'charlie_jg'), 'CharlieJungle', 'EUW', 'EUW1', 'JUNGLE', 'Diamond IV',
        'Jungle main, early-game focused.'),
       ((SELECT id FROM users WHERE username = 'diana_adc'), 'DianaShoots', 'EUW', 'EUW1', 'ADC', 'Diamond III',
        'ADC main, hyper-carry enjoyer.'),
       ((SELECT id FROM users WHERE username = 'eve_sup'), 'EveSupports', 'EUW', 'EUW1', 'SUPPORT', 'Platinum II',
        'Support main, engage enchanter flex.');

-- ========== TEAMS ==========
INSERT INTO teams (name, tag, captain_user_id)
VALUES ('Phoenix', 'PHX', (SELECT id FROM users WHERE username = 'alice_mid'));

-- Captain is auto-added as ACTIVE member with MID role in the application,
-- but for seeding we add explicit team_members rows matching the player profile main roles.
INSERT INTO team_members (team_id, user_id, role, is_substitute, status)
VALUES ((SELECT id FROM teams WHERE tag = 'PHX'), (SELECT id FROM users WHERE username = 'alice_mid'), 'MID', false,
        'ACTIVE'),
       ((SELECT id FROM teams WHERE tag = 'PHX'), (SELECT id FROM users WHERE username = 'bob_top'), 'TOP', false,
        'ACTIVE'),
       ((SELECT id FROM teams WHERE tag = 'PHX'), (SELECT id FROM users WHERE username = 'charlie_jg'), 'JUNGLE', false,
        'ACTIVE'),
       ((SELECT id FROM teams WHERE tag = 'PHX'), (SELECT id FROM users WHERE username = 'diana_adc'), 'ADC', false,
        'ACTIVE'),
       ((SELECT id FROM teams WHERE tag = 'PHX'), (SELECT id FROM users WHERE username = 'eve_sup'), 'SUPPORT', false,
        'ACTIVE');

-- ========== TOURNAMENTS ==========
INSERT INTO tournaments (organizer_user_id, name, game, format, registration_deadline, starts_at, max_teams, status)
VALUES ((SELECT id FROM users WHERE username = 'organizer_one'),
        'Spring Cup 2026',
        'League of Legends',
        'BO1',
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '10 days',
        8,
        'OPEN'),
       ((SELECT id FROM users WHERE username = 'organizer_one'),
        'Summer Clash 2026',
        'League of Legends',
        'BO3',
        NOW() + INTERVAL '30 days',
        NOW() + INTERVAL '45 days',
        16,
        'DRAFT');

COMMIT;
