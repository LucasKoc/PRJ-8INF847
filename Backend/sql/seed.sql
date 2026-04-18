-- DPSCHECK - Seed data (dev only)
-- Tous les mots de passe = "Password123!" (bcrypt cost 10)

BEGIN;

INSERT INTO users (email, username, password_hash, role) VALUES
  ('to1@dpscheck.test', 'organizer_one', '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'TO'),
  ('player1@dpscheck.test', 'captain_one',   '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER'),
  ('player2@dpscheck.test', 'jungler_one',   '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER'),
  ('player3@dpscheck.test', 'mid_one',       '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER'),
  ('player4@dpscheck.test', 'adc_one',       '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER'),
  ('player5@dpscheck.test', 'support_one',   '$2b$10$0wJ5VudE426J0km.Uqugp.qtKi3.poWQoCOdhQl/yvChHoLTlG6Y2', 'PLAYER');

INSERT INTO player_profiles (user_id, summoner_name, tag_line, region, main_role)
SELECT id, username, 'EUW', 'EUW1',
       (ARRAY['TOP','JUNGLE','MID','ADC','SUPPORT']::lol_roles[])[((id - 1) % 5) + 1]
FROM users WHERE role = 'PLAYER';

COMMIT;
